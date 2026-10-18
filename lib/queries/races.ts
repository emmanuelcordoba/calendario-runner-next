import { and, asc, eq, inArray, like, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disciplines, places, races } from '@/lib/db/schema';
import { slugify } from '@/lib/slug';

export async function getAllRaces() {
    return db
        .select({ race: races, discipline: disciplines })
        .from(races)
        .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
        .orderBy(asc(races.name));
}

export interface FiltrosCarreras {
    /** Texto libre: se busca por nombre, sin distinguir acentos ni mayúsculas. */
    q?: string;
    disciplineId?: number;
    provinceId?: number;
}

/**
 * Arma el WHERE de la búsqueda de carreras.
 *
 * El texto se compara contra `slug` y no contra `name` a propósito: el slug ya
 * viene en minúsculas y sin acentos, así que "Maratón" encuentra "maraton" sin
 * tener que anidar REPLACE en SQL (el LIKE de SQLite no es insensible a los
 * acentos). Como slugify deja solo [a-z0-9-], de paso descarta los comodines
 * `%` y `_` que el usuario pudiera escribir.
 */
function condiciones(filtros: FiltrosCarreras): SQL | undefined {
    const partes: SQL[] = [];

    const escrito = filtros.q?.trim() ?? '';
    if (escrito) {
        const termino = slugify(escrito);
        // Si lo que escribió no deja ningún caracter buscable (p. ej. "!!!"),
        // no coincide con nada. Ignorar el filtro devolvería la lista entera
        // con el campo de búsqueda lleno, que confunde más que un cero.
        partes.push(termino ? like(races.slug, `%${termino}%`) : sql`1 = 0`);
    }

    if (filtros.disciplineId) partes.push(eq(races.disciplineId, filtros.disciplineId));

    // Una carrera puede tener varios lugares, así que se filtra por subconsulta
    // en vez de join: con join la misma carrera aparecería repetida.
    if (filtros.provinceId) {
        partes.push(
            inArray(
                races.id,
                db
                    .select({ id: places.raceId })
                    .from(places)
                    .where(eq(places.provinceId, filtros.provinceId)),
            ),
        );
    }

    return partes.length ? and(...partes) : undefined;
}

export async function getRacesPaginated(
    page: number,
    pageSize: number,
    filtros: FiltrosCarreras = {},
) {
    const offset = (page - 1) * pageSize;
    const where = condiciones(filtros);

    const [rows, countRow] = await Promise.all([
        db
            .select({ race: races, discipline: disciplines })
            .from(races)
            .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
            .where(where)
            .orderBy(asc(races.name))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(races).where(where).get(),
    ]);
    return { rows, total: Number(countRow?.count ?? 0) };
}

export async function getRaceById(id: number) {
    return db.select().from(races).where(eq(races.id, id)).get();
}
