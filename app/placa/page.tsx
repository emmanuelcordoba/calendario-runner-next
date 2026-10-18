import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { verifyAdmin } from '@/lib/authz';
import { getUpcomingEditions } from '@/lib/queries/editions';
import {
    FORMATOS,
    type FormatoId,
    TEMAS,
    type TemaId,
    agruparPorFecha,
    contarCarreras,
    esFormato,
    esTema,
    nombreDiaCorto,
    numeroDia,
    quincenaPorDefecto,
    rangoLegible,
} from '@/lib/placa';

// Vive fuera de app/admin/ a propósito: un layout en App Router se hereda por
// carpeta, así que esta es la única forma de que la placa no traiga el menú del
// panel. Por eso el chequeo de admin va acá explícito, además del matcher de
// proxy.ts.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Placa para redes' };

interface Props {
    searchParams: Promise<{ from?: string; to?: string; formato?: string; tema?: string }>;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function PlacaPage({ searchParams }: Props) {
    if (!(await verifyAdmin())) redirect('/login');

    const params = await searchParams;
    const { from: defFrom, to: defTo } = quincenaPorDefecto();
    const from = ISO.test(params.from ?? '') ? params.from! : defFrom;
    const to = ISO.test(params.to ?? '') && params.to! >= from ? params.to! : defTo;
    const formato: FormatoId = esFormato(params.formato) ? params.formato : 'feed';
    const tema: TemaId = esTema(params.tema) ? params.tema : 'claro';

    const { ancho, alto } = FORMATOS[formato];
    const colores = TEMAS[tema];
    const dias = agruparPorFecha(await getUpcomingEditions({ from, to }));
    const total = contarCarreras(dias);

    const qs = (cambio: { formato?: FormatoId; tema?: TemaId }) =>
        new URLSearchParams({
            from,
            to,
            formato: cambio.formato ?? formato,
            tema: cambio.tema ?? tema,
        }).toString();

    // El alto fijo es el del formato; la escala solo achica la vista en pantalla
    // para que entre en una ventana normal. El PNG sale siempre a tamaño completo.
    const escala = { feed: 0.5, cuadrado: 0.62, historia: 0.35 }[formato];

    return (
        // El fondo de la página sí sigue el tema; el lienzo de abajo no.
        <div className="min-h-screen bg-muted p-6">
            {/* Controles: quedan fuera del recuadro que se captura */}
            <div className="mx-auto mb-5 flex max-w-4xl flex-wrap items-center gap-3 print:hidden">
                <div className="flex items-center gap-1 rounded-md border bg-card p-1">
                    {(Object.keys(FORMATOS) as FormatoId[]).map((f) => (
                        <Link
                            key={f}
                            href={`/placa?${qs({ formato: f })}`}
                            className={
                                'rounded px-3 py-1.5 text-sm transition-colors ' +
                                (f === formato
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
                            }
                        >
                            {FORMATOS[f].nombre}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-1 rounded-md border bg-card p-1">
                    {(Object.keys(TEMAS) as TemaId[]).map((t) => (
                        <Link
                            key={t}
                            href={`/placa?${qs({ tema: t })}`}
                            className={
                                'rounded px-3 py-1.5 text-sm transition-colors ' +
                                (t === tema
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
                            }
                        >
                            {TEMAS[t].nombre}
                        </Link>
                    ))}
                </div>

                <a
                    href={`/placa/imagen?${qs({})}`}
                    className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Descargar PNG
                </a>

                <span className="text-sm text-muted-foreground">
                    {ancho} × {alto} · {total} {total === 1 ? 'carrera' : 'carreras'}
                </span>

                <Link
                    href={`/admin/proximas?${new URLSearchParams({ from, to })}`}
                    className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                    Volver al panel
                </Link>
            </div>

            {/* El lienzo, a tamaño real y escalado solo para verlo */}
            <div
                className="mx-auto overflow-hidden rounded-lg shadow-2xl"
                style={{ width: ancho * escala, height: alto * escala }}
            >
                <div
                    style={{
                        width: ancho,
                        height: alto,
                        transform: `scale(${escala})`,
                        transformOrigin: 'top left',
                    }}
                >
                    <Lienzo
                        dias={dias}
                        from={from}
                        to={to}
                        alto={alto}
                        total={total}
                        colores={colores}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * El listado tal como se publica. Mantenerlo en flexbox y con estilos simples,
 * porque la ruta que genera el PNG dibuja esta misma estructura con Satori, que
 * no soporta grid.
 */
function Lienzo({
    dias,
    from,
    to,
    alto,
    total,
    colores,
}: {
    dias: ReturnType<typeof agruparPorFecha>;
    from: string;
    to: string;
    alto: number;
    total: number;
    colores: (typeof TEMAS)[TemaId];
}) {
    const compacto = total > 10;

    // Los colores van por `style` y no por clases de Tailwind porque dependen
    // del tema elegido, y Tailwind necesita nombres de clase estáticos. De paso,
    // son exactamente los mismos valores que usa la ruta del PNG.
    return (
        <div
            style={{ height: alto, backgroundColor: colores.fondo, color: colores.tinta }}
            className="flex w-full flex-col px-16 py-14"
        >
            <div className="shrink-0">
                <p
                    style={{ color: colores.marca }}
                    className="text-3xl font-semibold uppercase tracking-[0.2em]"
                >
                    Próximas carreras
                </p>
                {/* sin `capitalize`: pondría mayúscula en cada palabra, y el PNG
                    no tiene esa clase, así que las dos vistas divergirían */}
                <p className="mt-3 text-5xl font-bold">{rangoLegible(from, to)}</p>
                <div style={{ backgroundColor: colores.marca }} className="mt-6 h-1 w-28" />
            </div>

            <div className="mt-8 flex min-h-0 flex-1 flex-col justify-start">
                {dias.map((dia) => (
                    <div key={dia.fecha} className={compacto ? 'mb-5' : 'mb-8'}>
                        <p
                            style={{ color: colores.marca }}
                            className="text-2xl font-bold uppercase tracking-widest"
                        >
                            {nombreDiaCorto(dia.fecha)} {numeroDia(dia.fecha)}
                        </p>
                        {dia.carreras.map((c) => (
                            <div key={c.id} className={compacto ? 'mt-2' : 'mt-3'}>
                                <p
                                    className={
                                        'font-bold leading-tight ' +
                                        (compacto ? 'text-3xl' : 'text-4xl')
                                    }
                                >
                                    {c.nombre}
                                    {c.variosDias && (
                                        <span
                                            style={{ color: colores.suave }}
                                            className="ml-3 text-xl font-normal"
                                        >
                                            {c.variosDias}
                                        </span>
                                    )}
                                </p>
                                <p style={{ color: colores.suave }} className="mt-1 text-2xl">
                                    {[c.lugar, c.distancias].filter(Boolean).join('  ·  ')}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}

                {total === 0 && (
                    <p style={{ color: colores.tenue }} className="text-3xl">
                        No hay carreras publicadas en este período.
                    </p>
                )}
            </div>

            <p style={{ color: colores.tenue }} className="shrink-0 text-2xl">
                calendariorunner.com.ar
            </p>
        </div>
    );
}
