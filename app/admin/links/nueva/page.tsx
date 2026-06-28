export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { races } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import LinkForm from '../link-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nuevo link - Admin' };

export default async function NuevoLinkPage() {
    const allRaces = await db.select({ id: races.id, name: races.name }).from(races).orderBy(asc(races.name));
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nuevo link</h1>
            <LinkForm races={allRaces} />
        </div>
    );
}
