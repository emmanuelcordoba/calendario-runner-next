'use server';

import { db } from '@/lib/db';
import { localities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLocalityAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const name = (formData.get('name') as string)?.trim();
    const provinceId = Number(formData.get('province_id'));
    if (!name || !provinceId) return { error: 'Nombre y provincia son requeridos.' };
    await db.insert(localities).values({ name, provinceId });
    revalidatePath('/admin/localidades');
    redirect('/admin/localidades');
}

export async function updateLocalityAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const id = Number(formData.get('id'));
    const name = (formData.get('name') as string)?.trim();
    const provinceId = Number(formData.get('province_id'));
    if (!id || !name || !provinceId) return { error: 'Datos inválidos.' };
    await db.update(localities).set({ name, provinceId }).where(eq(localities.id, id));
    revalidatePath('/admin/localidades');
    redirect('/admin/localidades');
}

export async function deleteLocalityAction(formData: FormData) {
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(localities).where(eq(localities.id, id));
    revalidatePath('/admin/localidades');
}
