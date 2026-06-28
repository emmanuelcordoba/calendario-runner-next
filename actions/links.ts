'use server';

import { db } from '@/lib/db';
import { links } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLinkAction(
    _prev: { error?: string } | null,
    formData: FormData,
): Promise<{ error?: string }> {
    const raceId = Number(formData.get('race_id'));
    const type = formData.get('type') as string;
    const url = (formData.get('url') as string)?.trim() || null;
    const title = (formData.get('title') as string)?.trim() || null;
    if (!raceId || !type) return { error: 'Carrera y tipo son requeridos.' };
    await db.insert(links).values({ raceId, type, url, title });
    revalidatePath('/admin/links');
    redirect('/admin/links');
}

export async function deleteLinkAction(formData: FormData) {
    const id = Number(formData.get('id'));
    if (!id) return;
    await db.delete(links).where(eq(links.id, id));
    revalidatePath('/admin/links');
}
