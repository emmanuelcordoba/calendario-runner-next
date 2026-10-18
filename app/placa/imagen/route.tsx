import { ImageResponse } from 'next/og';
import { verifyAdmin } from '@/lib/authz';
import { getUpcomingEditions } from '@/lib/queries/editions';
import {
    FORMATOS,
    type FormatoId,
    agruparPorFecha,
    contarCarreras,
    esFormato,
    nombreDiaCorto,
    numeroDia,
    quincenaPorDefecto,
    rangoLegible,
} from '@/lib/placa';

export const dynamic = 'force-dynamic';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const LIMA = '#a3e635';
const GRIS = '#a3a3a3';

export async function GET(request: Request) {
    if (!(await verifyAdmin())) {
        return new Response('No autorizado.', { status: 401 });
    }

    const url = new URL(request.url);
    const { from: defFrom, to: defTo } = quincenaPorDefecto();
    const fromRaw = url.searchParams.get('from') ?? '';
    const toRaw = url.searchParams.get('to') ?? '';
    const from = ISO.test(fromRaw) ? fromRaw : defFrom;
    const to = ISO.test(toRaw) && toRaw >= from ? toRaw : defTo;
    const formatoRaw = url.searchParams.get('formato') ?? undefined;
    const formato: FormatoId = esFormato(formatoRaw) ? formatoRaw : 'feed';

    const { ancho, alto } = FORMATOS[formato];
    const dias = agruparPorFecha(await getUpcomingEditions({ from, to }));
    const total = contarCarreras(dias);
    const compacto = total > 10;

    // Satori soporta flexbox y un subset de CSS: nada de grid, y los estilos van
    // inline. Esta estructura es la misma que dibuja app/placa/page.tsx.
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#0a0a0a',
                    color: '#ffffff',
                    padding: '56px 64px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                        style={{
                            fontSize: 30,
                            fontWeight: 600,
                            letterSpacing: 6,
                            color: LIMA,
                            textTransform: 'uppercase',
                        }}
                    >
                        Próximas carreras
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 700, marginTop: 12 }}>
                        {rangoLegible(from, to)}
                    </div>
                    <div style={{ width: 112, height: 4, backgroundColor: LIMA, marginTop: 24 }} />
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        marginTop: 32,
                    }}
                >
                    {dias.map((dia) => (
                        <div
                            key={dia.fecha}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginBottom: compacto ? 20 : 32,
                            }}
                        >
                            {/* Un solo hijo de texto a propósito: en Satori, un
                                div con más de un hijo necesita display flex, y
                                `{a} {b}` en JSX ya son tres hijos. */}
                            <div
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    letterSpacing: 3,
                                    color: LIMA,
                                }}
                            >
                                {`${nombreDiaCorto(dia.fecha)} ${numeroDia(dia.fecha)}`}
                            </div>
                            {dia.carreras.map((c) => (
                                <div
                                    key={c.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginTop: compacto ? 8 : 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            fontSize: compacto ? 30 : 36,
                                            fontWeight: 700,
                                        }}
                                    >
                                        <span>{c.nombre}</span>
                                        {c.variosDias && (
                                            <span
                                                style={{
                                                    fontSize: 20,
                                                    fontWeight: 400,
                                                    color: GRIS,
                                                    marginLeft: 12,
                                                }}
                                            >
                                                {c.variosDias}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 24, color: GRIS, marginTop: 4 }}>
                                        {[c.lugar, c.distancias].filter(Boolean).join('  ·  ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {total === 0 && (
                        <div style={{ fontSize: 30, color: '#737373' }}>
                            No hay carreras publicadas en este período.
                        </div>
                    )}
                </div>

                <div style={{ fontSize: 24, color: '#737373' }}>calendariorunner.com.ar</div>
            </div>
        ),
        {
            width: ancho,
            height: alto,
            headers: {
                'Content-Disposition': `attachment; filename="carreras-${from}-al-${to}.png"`,
                'Cache-Control': 'no-store',
            },
        },
    );
}
