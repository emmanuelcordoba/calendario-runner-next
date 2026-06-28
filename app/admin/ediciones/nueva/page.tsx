export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import EditionForm from '../edition-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nueva edición - Admin' };

interface Props {
    searchParams: Promise<{ raceId?: string }>;
}

export default async function NuevaEdicionPage({ searchParams }: Props) {
    const { raceId } = await searchParams;
    const allRaces = await db.select({ id: races.id, name: races.name }).from(races).orderBy(asc(races.name));
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nueva edición</h1>
            <EditionForm races={allRaces} defaultRaceId={raceId ? Number(raceId) : undefined} />
        </div>
    );
}
