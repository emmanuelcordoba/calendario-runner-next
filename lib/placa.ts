import type { EditionWithRace } from '@/lib/queries/editions';

/**
 * Lógica compartida entre la vista de la placa y la ruta que genera el PNG.
 *
 * Las dos dibujan el mismo listado por caminos distintos: la vista con Tailwind
 * y el PNG con ImageResponse, que usa Satori y soporta solo un subset de CSS.
 * Para que no se desincronicen, todo lo que es *dato* (el rango, el agrupado,
 * los rótulos) vive acá y ninguno de los dos lo recalcula por su cuenta.
 */

export const FORMATOS = {
    feed: { nombre: 'Feed 4:5', ancho: 1080, alto: 1350 },
    cuadrado: { nombre: 'Cuadrado', ancho: 1080, alto: 1080 },
    historia: { nombre: 'Historia 9:16', ancho: 1080, alto: 1920 },
} as const;

export type FormatoId = keyof typeof FORMATOS;

export function esFormato(v: string | undefined): v is FormatoId {
    return !!v && v in FORMATOS;
}

/**
 * Los colores de la placa, literales y en un solo lugar.
 *
 * No son los tokens del tema del sitio a propósito: la placa se publica como
 * imagen y tiene que verse igual con el sitio en claro o en oscuro. Y como el
 * preview no puede armar clases de Tailwind desde una variable, los dos
 * caminos las aplican con `style`, así no hay forma de que se desincronicen.
 *
 * Sobre el fondo oscuro, `marca` no puede ser el borgoña de la paleta: #73030D
 * da 1.6:1 y el vino #732F3B da 2.0:1, ilegibles. #D76961 mantiene el matiz
 * del borgoña, más claro, y da 5.6:1.
 */
export const TEMAS = {
    claro: {
        nombre: 'Claro',
        fondo: '#F2F2F2',
        tinta: '#0D0D0D',
        marca: '#73030D',
        suave: '#595959', // 6.3:1 sobre el fondo
        tenue: '#8C8C8C',
    },
    oscuro: {
        nombre: 'Oscuro',
        fondo: '#0D0D0D',
        tinta: '#F2F2F2',
        marca: '#D76961', // 5.6:1 sobre el fondo
        suave: '#8C8C8C', // 5.8:1 sobre el fondo
        tenue: '#8C8C8C',
    },
} as const;

export type TemaId = keyof typeof TEMAS;

export function esTema(v: string | undefined): v is TemaId {
    return !!v && v in TEMAS;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Parte un YYYY-MM-DD en numeros, sin pasar por el huso horario local. */
function partes(iso: string): [number, number, number] {
    const [y, m, d] = iso.split('-').map(Number);
    return [y, m, d];
}

function aUTC(iso: string): Date {
    const [y, m, d] = partes(iso);
    return new Date(Date.UTC(y, m - 1, d));
}

function aISO(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
}

export function sumarDias(iso: string, dias: number): string {
    const f = aUTC(iso);
    f.setUTCDate(f.getUTCDate() + dias);
    return aISO(f);
}

export function diaSemana(iso: string): number {
    return aUTC(iso).getUTCDay();
}

export function nombreDia(iso: string): string {
    return DIAS[diaSemana(iso)];
}

export function nombreDiaCorto(iso: string): string {
    return DIAS_CORTO[diaSemana(iso)];
}

export function numeroDia(iso: string): number {
    return partes(iso)[2];
}

export function nombreMes(iso: string): string {
    return MESES[partes(iso)[1] - 1];
}

/**
 * Rango por defecto: del próximo lunes al domingo de dos semanas completas
 * después, o sea 14 días. Si hoy es lunes, arranca hoy.
 */
export function quincenaPorDefecto(hoyISO?: string): { from: string; to: string } {
    const hoy = hoyISO ?? aISO(new Date());
    const dia = diaSemana(hoy); // 0 domingo, 1 lunes
    const haciaLunes = dia === 1 ? 0 : (8 - dia) % 7;
    const from = sumarDias(hoy, haciaLunes);
    return { from, to: sumarDias(from, 13) };
}

/** "20 al 26 de octubre" · "27 de octubre al 9 de noviembre" · cruza años si hace falta */
export function rangoLegible(from: string, to: string): string {
    const [ay] = partes(from);
    const [by] = partes(to);
    const d1 = numeroDia(from);
    const d2 = numeroDia(to);
    const m1 = nombreMes(from);
    const m2 = nombreMes(to);
    if (ay !== by) return `${d1} de ${m1} de ${ay} al ${d2} de ${m2} de ${by}`;
    if (m1 !== m2) return `${d1} de ${m1} al ${d2} de ${m2}`;
    return `${d1} al ${d2} de ${m1}`;
}

export interface DiaConCarreras {
    fecha: string;
    carreras: {
        id: number;
        nombre: string;
        lugar: string | null;
        distancias: string;
        variosDias: string | null;
    }[];
}

/**
 * Agrupa las ediciones por fecha de inicio. Las de varios días se listan en su
 * día de inicio, con el rango aclarado al costado.
 */
export function agruparPorFecha(ediciones: EditionWithRace[]): DiaConCarreras[] {
    const porFecha = new Map<string, DiaConCarreras['carreras']>();
    for (const e of ediciones) {
        if (!porFecha.has(e.startDate)) porFecha.set(e.startDate, []);
        porFecha.get(e.startDate)!.push({
            id: e.id,
            nombre: e.race.name,
            lugar: e.race.finalPlace,
            distancias: e.distances.join(' · '),
            variosDias:
                e.endDate && e.endDate !== e.startDate
                    ? `hasta el ${numeroDia(e.endDate)}`
                    : null,
        });
    }
    return [...porFecha.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, carreras]) => ({ fecha, carreras }));
}

export function contarCarreras(dias: DiaConCarreras[]): number {
    return dias.reduce((n, d) => n + d.carreras.length, 0);
}
