import Link from 'next/link';
import type { Metadata } from 'next';
import { getUpcomingEditions } from '@/lib/queries/editions';
import {
    agruparPorFecha,
    contarCarreras,
    nombreDia,
    numeroDia,
    quincenaPorDefecto,
    rangoLegible,
} from '@/lib/placa';
import RangeForm from './range-form';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Próximas carreras - Admin' };

interface Props {
    searchParams: Promise<{ from?: string; to?: string }>;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function AdminProximasPage({ searchParams }: Props) {
    const params = await searchParams;
    const { from: defaultFrom, to: defaultTo } = quincenaPorDefecto();

    const from = ISO.test(params.from ?? '') ? params.from! : defaultFrom;
    const to = ISO.test(params.to ?? '') && params.to! >= from ? params.to! : defaultTo;

    const ediciones = await getUpcomingEditions({ from, to });
    const dias = agruparPorFecha(ediciones);
    const total = contarCarreras(dias);

    const placa = `/placa?${new URLSearchParams({ from, to })}`;

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Próximas carreras</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {rangoLegible(from, to)} — {total}{' '}
                        {total === 1 ? 'carrera' : 'carreras'}
                    </p>
                </div>
                <Link
                    href={placa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Generar placa para redes
                </Link>
            </div>

            <RangeForm from={from} to={to} defaultFrom={defaultFrom} defaultTo={defaultTo} />

            <div className="mt-4 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                            <th className="px-4 py-3 text-left font-medium">Carrera</th>
                            <th className="px-4 py-3 text-left font-medium">Lugar</th>
                            <th className="px-4 py-3 text-left font-medium">Distancias</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {dias.map((dia) =>
                            dia.carreras.map((carrera, i) => (
                                <tr key={carrera.id} className="bg-card hover:bg-muted/30">
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {i === 0 ? (
                                            <span className="font-medium">
                                                {nombreDia(dia.fecha)} {numeroDia(dia.fecha)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">·</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {carrera.nombre}
                                        {carrera.variosDias && (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                {carrera.variosDias}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {carrera.lugar ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {carrera.distancias || '—'}
                                    </td>
                                </tr>
                            )),
                        )}
                        {total === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                    No hay carreras publicadas en este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                Lista solo ediciones publicadas, igual que el sitio. Si falta una carrera que
                esperabas, revisá que la edición y la carrera estén publicadas.
            </p>
        </div>
    );
}
