'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUserAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const isAdmin = formData.get('is_admin') === 'on';

    if (!name || !email || !password) return { error: 'Todos los campos son requeridos.' };

    const hashed = await bcrypt.hash(password, 12);
    await db.insert(users).values({ name, email, password: hashed, isAdmin });

    revalidatePath('/admin/usuarios');
    redirect('/admin/usuarios');
}

export async function updateUserAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const id = Number(formData.get('id'));
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const isAdmin = formData.get('is_admin') === 'on';

    if (!id || !name || !email) return { error: 'Datos inválidos.' };

    const updates: Partial<{ name: string; email: string; password: string; isAdmin: boolean }> = {
        name, email, isAdmin,
    };
    if (password) {
        updates.password = await bcrypt.hash(password, 12);
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    revalidatePath('/admin/usuarios');
    redirect('/admin/usuarios');
}

export async function deleteUserAction(formData: FormData) {
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/usuarios');
}
