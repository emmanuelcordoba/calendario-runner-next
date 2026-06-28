'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(
    _prevState: { error?: string; success?: string } | null,
    formData: FormData,
): Promise<{ error?: string; success?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado.' };

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();

    if (!name || !email) return { error: 'Nombre y email son requeridos.' };

    await db
        .update(users)
        .set({ name, email })
        .where(eq(users.id, Number(session.user.id)));

    revalidatePath('/perfil');
    return { success: 'Perfil actualizado.' };
}

export async function updatePasswordAction(
    _prevState: { error?: string; success?: string } | null,
    formData: FormData,
): Promise<{ error?: string; success?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado.' };

    const current = formData.get('current_password') as string;
    const newPass = formData.get('password') as string;
    const confirm = formData.get('password_confirmation') as string;

    if (!current || !newPass || !confirm) return { error: 'Todos los campos son requeridos.' };
    if (newPass !== confirm) return { error: 'Las contraseñas no coinciden.' };
    if (newPass.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.' };

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(session.user.id)))
        .get();

    if (!user) return { error: 'Usuario no encontrado.' };

    const match = await bcrypt.compare(current, user.password);
    if (!match) return { error: 'La contraseña actual es incorrecta.' };

    const hashed = await bcrypt.hash(newPass, 12);
    await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));

    return { success: 'Contraseña actualizada.' };
}
