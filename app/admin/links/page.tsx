import Link from 'next/link';
import { db } from '@/lib/db';
import { links, races } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { deleteLinkAction } from '@/actions/links';
import DeleteButton from '@/components/admin/delete-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Links - Admin' };

export default async function AdminLinksPage() {
    const rows = await db
        .select({ link: links, race: races })
        .from(links)
        .innerJoin(races, eq(links.raceId, races.id))
        .orderBy(asc(races.name));

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Links</h1>
                <Link href="/admin/links/nueva" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Nuevo link</Link>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Carrera</th>
                            <th className="px-4 py-3 text-left font-medium">Tipo</th>
                            <th className="px-4 py-3 text-left font-medium">URL</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ link, race }) => (
                            <tr key={link.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{race.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{link.type}</td>
                                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                    {link.url ? <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link.url}</a> : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <DeleteButton action={deleteLinkAction} message="¿Eliminar link?">
                                        <input type="hidden" name="id" value={link.id} />
                                        <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                    </DeleteButton>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay links cargados.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
