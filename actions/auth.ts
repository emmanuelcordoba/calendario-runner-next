'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { passwordResetTokens, users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function loginAction(
    _prevState: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/',
        });
    } catch (err) {
        if (err instanceof AuthError) {
            return { error: 'Email o contraseña incorrectos.' };
        }
        throw err;
    }
    return {};
}

export async function logoutAction() {
    await signOut({ redirectTo: '/' });
}

export async function forgotPasswordAction(
    _prevState: { error?: string; success?: string } | null,
    formData: FormData,
): Promise<{ error?: string; success?: string }> {
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    if (!email) return { error: 'El email es requerido.' };

    const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
    if (!user) {
        return { success: 'Si existe una cuenta con ese email, recibirás un enlace en breve.' };
    }

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    await db
        .insert(passwordResetTokens)
        .values({ email, token })
        .onConflictDoUpdate({ target: passwordResetTokens.email, set: { token, createdAt: sql`CURRENT_TIMESTAMP` } });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: email,
        subject: 'Restablecer contraseña - Calendario Runner',
        html: `<p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este enlace expira en 1 hora.</p>`,
    });

    return { success: 'Si existe una cuenta con ese email, recibirás un enlace en breve.' };
}

export async function registerAction(
    _prevState: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    if (process.env.REGISTRATION_ENABLED !== 'true') {
        return { error: 'El registro no está habilitado.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('password_confirmation') as string;

    if (!name || !email || !password) return { error: 'Todos los campos son requeridos.' };
    if (password !== passwordConfirm) return { error: 'Las contraseñas no coinciden.' };
    if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
    if (existing) return { error: 'Ya existe una cuenta con ese email.' };

    const hashed = await bcrypt.hash(password, 12);
    await db.insert(users).values({ name, email, password: hashed });

    await signIn('credentials', { email, password, redirectTo: '/' });
    return {};
}
