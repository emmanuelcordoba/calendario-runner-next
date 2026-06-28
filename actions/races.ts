'use server';

import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

export async function createRaceAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const name = (formData.get('name') as string)?.trim();
    const disciplineId = Number(formData.get('discipline_id'));
    const description = (formData.get('description') as string)?.trim() || null;
    const image = (formData.get('image') as string)?.trim() || null;
    const place = (formData.get('place') as string)?.trim() || null;

    if (!name || !disciplineId) return { error: 'Nombre y disciplina son requeridos.' };

    const slug = generateSlug(name);
    await db.insert(races).values({ name, slug, disciplineId, description, image, place });

    revalidatePath('/');
    revalidatePath('/admin/carreras');
    redirect('/admin/carreras');
}

export async function updateRaceAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const id = Number(formData.get('id'));
    const name = (formData.get('name') as string)?.trim();
    const disciplineId = Number(formData.get('discipline_id'));
    const description = (formData.get('description') as string)?.trim() || null;
    const image = (formData.get('image') as string)?.trim() || null;
    const place = (formData.get('place') as string)?.trim() || null;
    const slug = (formData.get('slug') as string)?.trim();

    if (!id || !name || !disciplineId) return { error: 'Datos inválidos.' };

    await db.update(races).set({ name, slug, disciplineId, description, image, place }).where(eq(races.id, id));

    revalidatePath('/');
    revalidatePath('/admin/carreras');
    redirect('/admin/carreras');
}

export async function deleteRaceAction(formData: FormData) {
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(races).where(eq(races.id, id));
    revalidatePath('/');
    revalidatePath('/admin/carreras');
}
