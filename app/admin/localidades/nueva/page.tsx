export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { provinces } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import LocalityForm from '../locality-form';

export default async function NuevaLocalidadPage() {
    const allProvinces = await db.select().from(provinces).orderBy(asc(provinces.name));
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nueva localidad</h1>
            <LocalityForm provinces={allProvinces} />
        </div>
    );
}
