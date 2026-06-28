import Link from 'next/link';
import { db } from '@/lib/db';
import { places, races, provinces, localities } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { deletePlaceAction } from '@/actions/places';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Lugares - Admin' };

export default async function AdminLugaresPage() {
    const rows = await db
        .select({ place: places, race: races, province: provinces, locality: localities })
        .from(places)
        .innerJoin(races, eq(places.raceId, races.id))
        .innerJoin(provinces, eq(places.provinceId, provinces.id))
        .leftJoin(localities, eq(places.localityId, localities.id))
        .orderBy(asc(races.name));

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Lugares</h1>
                <Link href="/admin/lugares/nueva" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Nuevo lugar</Link>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Carrera</th>
                            <th className="px-4 py-3 text-left font-medium">Provincia</th>
                            <th className="px-4 py-3 text-left font-medium">Localidad</th>
                            <th className="px-4 py-3 text-left font-medium">Lugar</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ place, race, province, locality }) => (
                            <tr key={place.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{race.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{province.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{locality?.name ?? '—'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{place.place ?? '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <form action={deletePlaceAction}>
                                        <input type="hidden" name="id" value={place.id} />
                                        <button type="submit" className="text-destructive underline-offset-4 hover:underline" onClick={(e) => { if (!confirm('¿Eliminar lugar?')) e.preventDefault(); }}>Eliminar</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay lugares cargados.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
