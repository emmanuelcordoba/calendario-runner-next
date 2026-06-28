export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import LinkForm from '../link-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nuevo link - Admin' };

interface Props {
    searchParams: Promise<{ raceId?: string }>;
}

export default async function NuevoLinkPage({ searchParams }: Props) {
    const { raceId } = await searchParams;
    const allRaces = await db.select({ id: races.id, name: races.name }).from(races).orderBy(asc(races.name));
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nuevo link</h1>
            <LinkForm races={allRaces} defaultRaceId={raceId ? Number(raceId) : undefined} />
        </div>
    );
}
