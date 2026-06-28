export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllDisciplines } from '@/lib/queries/disciplines';
import { getRaceById } from '@/lib/queries/races';
import { getEditionsByRaceId } from '@/lib/queries/editions';
import { db } from '@/lib/db';
import { links, places, provinces, localities } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteEditionAction } from '@/actions/editions';
import { deleteLinkAction } from '@/actions/links';
import { deletePlaceAction } from '@/actions/places';
import DeleteButton from '@/components/admin/delete-button';
import RaceForm from '../race-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editar carrera - Admin' };

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditarCarreraPage({ params }: Props) {
    const { id } = await params;
    const raceId = Number(id);

    const [race, disciplines, editions, raceLinks, racePlaces] = await Promise.all([
        getRaceById(raceId),
        getAllDisciplines(),
        getEditionsByRaceId(raceId),
        db.select().from(links).where(eq(links.raceId, raceId)),
        db
            .select({ place: places, province: provinces, locality: localities })
            .from(places)
            .innerJoin(provinces, eq(places.provinceId, provinces.id))
            .leftJoin(localities, eq(places.localityId, localities.id))
            .where(eq(places.raceId, raceId)),
    ]);

    if (!race) notFound();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="mb-6 text-2xl font-bold">Editar carrera</h1>
                <RaceForm race={race} disciplines={disciplines} />
            </div>

            {/* Ediciones */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Ediciones</h2>
                    <Link
                        href={`/admin/ediciones/nueva?raceId=${raceId}`}
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Nueva edición
                    </Link>
                </div>
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Inicio</th>
                                <th className="px-4 py-3 text-left font-medium">Fin</th>
                                <th className="px-4 py-3 text-left font-medium">Distancias</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {editions.map((ed) => (
                                <tr key={ed.id} className="bg-card hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground">{ed.startDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{ed.endDate}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{ed.distances.join(', ')}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/ediciones/${ed.id}`} className="text-primary underline-offset-4 hover:underline">Editar</Link>
                                            <DeleteButton action={deleteEditionAction} message="¿Eliminar esta edición?">
                                                <input type="hidden" name="id" value={ed.id} />
                                                <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                            </DeleteButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {editions.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Sin ediciones.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lugares */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Lugares</h2>
                    <Link
                        href={`/admin/lugares/nueva?raceId=${raceId}`}
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Nuevo lugar
                    </Link>
                </div>
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Provincia</th>
                                <th className="px-4 py-3 text-left font-medium">Localidad</th>
                                <th className="px-4 py-3 text-left font-medium">Lugar específico</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {racePlaces.map(({ place, province, locality }) => (
                                <tr key={place.id} className="bg-card hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground">{province.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{locality?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{place.place ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <DeleteButton action={deletePlaceAction} message="¿Eliminar este lugar?">
                                            <input type="hidden" name="id" value={place.id} />
                                            <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                        </DeleteButton>
                                    </td>
                                </tr>
                            ))}
                            {racePlaces.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Sin lugares.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Links */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Links</h2>
                    <Link
                        href={`/admin/links/nueva?raceId=${raceId}`}
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Nuevo link
                    </Link>
                </div>
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium">URL</th>
                                <th className="px-4 py-3 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {raceLinks.map((link) => (
                                <tr key={link.id} className="bg-card hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground">{link.type}</td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                        {link.url
                                            ? <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link.url}</a>
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/links/${link.id}`} className="text-primary underline-offset-4 hover:underline">Editar</Link>
                                            <DeleteButton action={deleteLinkAction} message="¿Eliminar link?">
                                                <input type="hidden" name="id" value={link.id} />
                                                <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                            </DeleteButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {raceLinks.length === 0 && (
                                <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">Sin links.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
