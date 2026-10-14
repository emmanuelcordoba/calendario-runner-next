'use server';

import { requireAdmin, verifyAdmin } from '@/lib/authz';
import { db } from '@/lib/db';
import { editions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEditionAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    if (!(await verifyAdmin())) return { error: 'No autorizado.' };

    const raceId = Number(formData.get('race_id'));
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const distancesRaw = formData.get('distances') as string;
    const image = (formData.get('image') as string)?.trim() || null;

    if (!raceId || !startDate || !endDate) return { error: 'Faltan datos requeridos.' };

    const distances = distancesRaw
        ? JSON.stringify(distancesRaw.split(',').map((d) => d.trim()).filter(Boolean))
        : '[]';

    await db.insert(editions).values({ raceId, startDate, endDate, distances, image });

    revalidatePath('/');
    revalidatePath('/admin/ediciones');
    const redirectTo = (formData.get('redirect_to') as string) || '/admin/ediciones';
    redirect(redirectTo);
}

export async function updateEditionAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    if (!(await verifyAdmin())) return { error: 'No autorizado.' };

    const id = Number(formData.get('id'));
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const distancesRaw = formData.get('distances') as string;
    const image = (formData.get('image') as string)?.trim() || null;

    if (!id || !startDate || !endDate) return { error: 'Datos inválidos.' };

    const distances = distancesRaw
        ? JSON.stringify(distancesRaw.split(',').map((d) => d.trim()).filter(Boolean))
        : '[]';

    await db.update(editions).set({ startDate, endDate, distances, image }).where(eq(editions.id, id));

    revalidatePath('/');
    revalidatePath('/admin/ediciones');
    const redirectTo = (formData.get('redirect_to') as string) || '/admin/ediciones';
    redirect(redirectTo);
}

export async function deleteEditionAction(formData: FormData) {
    await requireAdmin();

    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(editions).where(eq(editions.id, id));
    revalidatePath('/');
    revalidatePath('/admin/ediciones');
    revalidatePath('/admin/carreras', 'layout');
}

export async function toggleEditionPublishedAction(formData: FormData) {
    await requireAdmin();

    const id = Number(formData.get('id'));
    const current = formData.get('published') === 'true';
    if (!id) return;
    await db.update(editions).set({ published: !current }).where(eq(editions.id, id));
    revalidatePath('/');
    revalidatePath('/admin/ediciones');
    revalidatePath('/admin/carreras', 'layout');
}
