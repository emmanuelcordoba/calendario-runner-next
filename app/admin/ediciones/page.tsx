import Link from 'next/link';
import { db } from '@/lib/db';
import { editions, races } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { deleteEditionAction } from '@/actions/editions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Ediciones - Admin' };

export default async function AdminEdicionesPage() {
    const rows = await db
        .select({ edition: editions, race: races })
        .from(editions)
        .innerJoin(races, eq(editions.raceId, races.id))
        .orderBy(asc(editions.startDate));

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ediciones</h1>
                <Link
                    href="/admin/ediciones/nueva"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Nueva edición
                </Link>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Carrera</th>
                            <th className="px-4 py-3 text-left font-medium">Inicio</th>
                            <th className="px-4 py-3 text-left font-medium">Fin</th>
                            <th className="px-4 py-3 text-left font-medium">Distancias</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ edition, race }) => {
                            let distances: string[] = [];
                            try { distances = JSON.parse(edition.distances); } catch { distances = []; }
                            return (
                                <tr key={edition.id} className="bg-card hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{race.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{edition.startDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{edition.endDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{distances.join(', ')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/ediciones/${edition.id}`} className="text-primary underline-offset-4 hover:underline">Editar</Link>
                                            <form action={deleteEditionAction}>
                                                <input type="hidden" name="id" value={edition.id} />
                                                <button type="submit" className="text-destructive underline-offset-4 hover:underline" onClick={(e) => { if (!confirm('¿Eliminar esta edición?')) e.preventDefault(); }}>Eliminar</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {rows.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay ediciones cargadas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
