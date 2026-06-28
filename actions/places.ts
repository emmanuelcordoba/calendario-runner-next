'use server';

import { db } from '@/lib/db';
import { places } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPlaceAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const raceId = Number(formData.get('race_id'));
    const provinceId = Number(formData.get('province_id'));
    const localityId = Number(formData.get('locality_id')) || null;
    const place = (formData.get('place') as string)?.trim() || null;
    if (!raceId || !provinceId) return { error: 'Carrera y provincia son requeridos.' };
    await db.insert(places).values({ raceId, provinceId, localityId, place });
    revalidatePath('/admin/lugares');
    redirect('/admin/lugares');
}

export async function deletePlaceAction(formData: FormData) {
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(places).where(eq(places.id, id));
    revalidatePath('/admin/lugares');
}
