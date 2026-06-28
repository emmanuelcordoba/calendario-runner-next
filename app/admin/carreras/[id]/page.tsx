export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAllDisciplines } from '@/lib/queries/disciplines';
import { getRaceById } from '@/lib/queries/races';
import RaceForm from '../race-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar carrera - Admin' };

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditarCarreraPage({ params }: Props) {
    const { id } = await params;
    const [race, disciplines] = await Promise.all([
        getRaceById(Number(id)),
        getAllDisciplines(),
    ]);

    if (!race) notFound();

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Editar carrera</h1>
            <RaceForm race={race} disciplines={disciplines} />
        </div>
    );
}
