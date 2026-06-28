export const dynamic = 'force-dynamic';

import { getAllDisciplines } from '@/lib/queries/disciplines';
import RaceForm from '../race-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Nueva carrera - Admin' };

export default async function NuevaCarreraPage() {
    const disciplines = await getAllDisciplines();
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Nueva carrera</h1>
            <RaceForm disciplines={disciplines} />
        </div>
    );
}
