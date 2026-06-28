import { Suspense } from 'react';
import { getUpcomingEditions } from '@/lib/queries/editions';
import { getAllDisciplines } from '@/lib/queries/disciplines';
import RaceFilters from '@/components/races/race-filters';
import RaceItem from '@/components/races/race-item';

export const revalidate = 3600;

interface Props {
    searchParams: Promise<{ from?: string; to?: string; discipline?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
    const params = await searchParams;

    const today = new Date();
    const defaultFrom = today.toISOString().split('T')[0];
    const defaultTo = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
    )
        .toISOString()
        .split('T')[0];

    const from = params.from || defaultFrom;
    const to = params.to || defaultTo;
    const discipline = params.discipline || 'all';

    const isSearch = !!(params.from || params.to || params.discipline);

    const [editions, disciplines] = await Promise.all([
        getUpcomingEditions({ from, to, disciplineId: discipline }),
        getAllDisciplines(),
    ]);

    return (
        <section>
            <h3 className="text-2xl font-semibold">
                {isSearch ? 'Buscador' : 'Próximas carreras'}
            </h3>
            <div className="mt-3">
                <Suspense>
                    <RaceFilters
                        from={from}
                        to={to}
                        disciplineId={discipline}
                        disciplines={disciplines}
                    />
                </Suspense>
                <ul className="mt-4 space-y-3">
                    {editions.length === 0 ? (
                        <li className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
                            No se encontraron carreras para este período.
                        </li>
                    ) : (
                        editions.map((edition) => (
                            <li key={edition.id}>
                                <RaceItem edition={edition} />
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    );
}
