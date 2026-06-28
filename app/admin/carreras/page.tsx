import Link from 'next/link';
import { getRacesPaginated } from '@/lib/queries/races';
import { deleteRaceAction } from '@/actions/races';
import DeleteButton from '@/components/admin/delete-button';
import Pagination from '@/components/admin/pagination';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Carreras - Admin' };

const VALID_SIZES = [10, 20, 50, 100];
const DEFAULT_SIZE = 20;

interface Props {
    searchParams: Promise<{ page?: string; size?: string }>;
}

export default async function AdminCarrerasPage({ searchParams }: Props) {
    const { page: pageParam, size: sizeParam } = await searchParams;
    const pageSize = VALID_SIZES.includes(Number(sizeParam)) ? Number(sizeParam) : DEFAULT_SIZE;
    const page = Math.max(1, Number(pageParam ?? 1));
    const { rows, total } = await getRacesPaginated(page, pageSize);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Carreras</h1>
                <Link
                    href="/admin/carreras/nueva"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Nueva carrera
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium">Disciplina</th>
                            <th className="px-4 py-3 text-left font-medium">Lugar</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ race, discipline }) => (
                            <tr key={race.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{race.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{discipline.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{race.place ?? '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/carreras/${race.id}`}
                                            className="text-primary underline-offset-4 hover:underline"
                                        >
                                            Editar
                                        </Link>
                                        <DeleteButton action={deleteRaceAction} message="¿Eliminar esta carrera?">
                                            <input type="hidden" name="id" value={race.id} />
                                            <button type="submit" className="text-destructive underline-offset-4 hover:underline">
                                                Eliminar
                                            </button>
                                        </DeleteButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No hay carreras cargadas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} total={total} pageSize={pageSize} basePath="/admin/carreras" />
        </div>
    );
}
