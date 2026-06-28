export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { editions, races } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import EditionForm from '../edition-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar edición - Admin' };

interface Props { params: Promise<{ id: string }> }

export default async function EditarEdicionPage({ params }: Props) {
    const { id } = await params;
    const [edition, allRaces] = await Promise.all([
        db.select().from(editions).where(eq(editions.id, Number(id))).get(),
        db.select({ id: races.id, name: races.name }).from(races).orderBy(asc(races.name)),
    ]);
    if (!edition) notFound();
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Editar edición</h1>
            <EditionForm edition={edition} races={allRaces} />
        </div>
    );
}
