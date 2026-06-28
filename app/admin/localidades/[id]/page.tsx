export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { localities, provinces } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import LocalityForm from '../locality-form';

interface Props { params: Promise<{ id: string }> }

export default async function EditarLocalidadPage({ params }: Props) {
    const { id } = await params;
    const [locality, allProvinces] = await Promise.all([
        db.select().from(localities).where(eq(localities.id, Number(id))).get(),
        db.select().from(provinces).orderBy(asc(provinces.name)),
    ]);
    if (!locality) notFound();
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Editar localidad</h1>
            <LocalityForm locality={locality} provinces={allProvinces} />
        </div>
    );
}
