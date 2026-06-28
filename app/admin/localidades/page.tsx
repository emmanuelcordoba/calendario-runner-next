import Link from 'next/link';
import { db } from '@/lib/db';
import { localities, provinces } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { deleteLocalityAction } from '@/actions/localities';
import DeleteButton from '@/components/admin/delete-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Localidades - Admin' };

export default async function AdminLocalidadesPage() {
    const rows = await db
        .select({ locality: localities, province: provinces })
        .from(localities)
        .innerJoin(provinces, eq(localities.provinceId, provinces.id))
        .orderBy(asc(provinces.name), asc(localities.name));

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Localidades</h1>
                <Link href="/admin/localidades/nueva" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Nueva localidad</Link>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium">Provincia</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ locality, province }) => (
                            <tr key={locality.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{locality.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{province.name}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/localidades/${locality.id}`} className="text-primary underline-offset-4 hover:underline">Editar</Link>
                                        <DeleteButton action={deleteLocalityAction} message="¿Eliminar localidad?">
                                            <input type="hidden" name="id" value={locality.id} />
                                            <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                        </DeleteButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No hay localidades.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
