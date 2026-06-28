export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { races, provinces, localities } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import PlaceForm from '../place-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nuevo lugar - Admin' };

export default async function NuevoLugarPage() {
    const [allRaces, allProvinces, allLocalities] = await Promise.all([
        db.select({ id: races.id, name: races.name }).from(races).orderBy(asc(races.name)),
        db.select().from(provinces).orderBy(asc(provinces.name)),
        db.select().from(localities).orderBy(asc(localities.name)),
    ]);
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nuevo lugar</h1>
            <PlaceForm races={allRaces} provinces={allProvinces} localities={allLocalities} />
        </div>
    );
}
