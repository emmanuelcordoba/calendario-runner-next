import { and, asc, between, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disciplines, editions, links, localities, places, provinces, races } from '@/lib/db/schema';

export interface EditionWithRace {
    id: number;
    startDate: string;
    endDate: string;
    distances: string[];
    image: string | null;
    race: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        place: string | null;
        finalPlace: string | null;
        discipline: { id: number; name: string };
        links: { id: number; type: string; title: string | null; url: string | null }[];
        places: {
            id: number;
            place: string | null;
            province: { id: number; name: string };
            locality: { id: number; name: string } | null;
        }[];
    };
}

function parseDistances(raw: string): string[] {
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function computeFinalPlace(
    place: string | null,
    racePlaces: { place: string | null; province: { name: string }; locality: { name: string } | null }[],
): string | null {
    if (place) return place;
    if (racePlaces.length === 0) return null;
    const first = racePlaces[0];
    const parts = [first.locality?.name, first.province.name].filter(Boolean);
    return parts.join(', ') || null;
}

export async function getUpcomingEditions(params: {
    from?: string;
    to?: string;
    disciplineId?: string;
}): Promise<EditionWithRace[]> {
    const today = new Date();
    const defaultFrom = today.toISOString().split('T')[0];
    const defaultTo = new Date(today.setFullYear(today.getFullYear() + 1))
        .toISOString()
        .split('T')[0];

    const from = params.from || defaultFrom;
    const to = params.to || defaultTo;

    const conditions = [between(editions.startDate, from, to)];

    const rows = await db
        .select({
            edition: editions,
            race: races,
            discipline: disciplines,
        })
        .from(editions)
        .innerJoin(races, eq(editions.raceId, races.id))
        .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
        .where(and(...conditions))
        .orderBy(asc(editions.startDate));

    const filteredRows =
        params.disciplineId && params.disciplineId !== 'all'
            ? rows.filter((r) => r.race.disciplineId === Number(params.disciplineId))
            : rows;

    const raceIds = [...new Set(filteredRows.map((r) => r.race.id))];

    type LinkRow = { id: number; raceId: number; type: string; title: string | null; url: string | null };
    type PlaceRow = { place: { id: number; raceId: number; provinceId: number; localityId: number | null; place: string | null }; province: { id: number; name: string }; locality: { id: number; name: string; provinceId: number } | null };

    let allLinks: LinkRow[] = [];
    let allPlaces: PlaceRow[] = [];

    if (raceIds.length > 0) {
        const whereLinks = raceIds.length === 1 ? eq(links.raceId, raceIds[0]) : inArray(links.raceId, raceIds);
        const wherePlaces = raceIds.length === 1 ? eq(places.raceId, raceIds[0]) : inArray(places.raceId, raceIds);
        [allLinks, allPlaces] = await Promise.all([
            db.select().from(links).where(whereLinks) as Promise<LinkRow[]>,
            db.select({ place: places, province: provinces, locality: localities })
                .from(places)
                .innerJoin(provinces, eq(places.provinceId, provinces.id))
                .leftJoin(localities, eq(places.localityId, localities.id))
                .where(wherePlaces) as Promise<PlaceRow[]>,
        ]);
    }

    const linksByRace = new Map<number, LinkRow[]>();
    for (const link of allLinks) {
        if (!linksByRace.has(link.raceId)) linksByRace.set(link.raceId, []);
        linksByRace.get(link.raceId)!.push(link);
    }

    const placesByRace = new Map<number, PlaceRow[]>();
    for (const p of allPlaces) {
        if (!placesByRace.has(p.place.raceId)) placesByRace.set(p.place.raceId, []);
        placesByRace.get(p.place.raceId)!.push(p);
    }

    return filteredRows.map(({ edition, race, discipline }) => {
        const racePlaces = (placesByRace.get(race.id) ?? []).map((p) => ({
            id: p.place.id,
            place: p.place.place,
            province: p.province,
            locality: p.locality,
        }));

        return {
            id: edition.id,
            startDate: edition.startDate,
            endDate: edition.endDate,
            distances: parseDistances(edition.distances),
            image: edition.image,
            race: {
                id: race.id,
                name: race.name,
                slug: race.slug,
                description: race.description,
                image: race.image,
                place: race.place,
                finalPlace: computeFinalPlace(race.place, racePlaces),
                discipline: { id: discipline.id, name: discipline.name },
                links: (linksByRace.get(race.id) ?? []).map((l) => ({
                    id: l.id,
                    type: l.type,
                    title: l.title,
                    url: l.url,
                })),
                places: racePlaces,
            },
        };
    });
}

export async function getEditionBySlugAndYear(
    slug: string,
    year: string,
): Promise<EditionWithRace | null> {
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;

    const row = await db
        .select({
            edition: editions,
            race: races,
            discipline: disciplines,
        })
        .from(editions)
        .innerJoin(races, eq(editions.raceId, races.id))
        .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
        .where(
            and(
                eq(races.slug, slug),
                between(editions.startDate, startOfYear, endOfYear),
            ),
        )
        .get();

    if (!row) return null;

    const [raceLinks, racePlacesRaw] = await Promise.all([
        db.select().from(links).where(eq(links.raceId, row.race.id)),
        db
            .select({ place: places, province: provinces, locality: localities })
            .from(places)
            .innerJoin(provinces, eq(places.provinceId, provinces.id))
            .leftJoin(localities, eq(places.localityId, localities.id))
            .where(eq(places.raceId, row.race.id)),
    ]);

    const racePlaces = racePlacesRaw.map((p) => ({
        id: p.place.id,
        place: p.place.place,
        province: p.province,
        locality: p.locality,
    }));

    return {
        id: row.edition.id,
        startDate: row.edition.startDate,
        endDate: row.edition.endDate,
        distances: parseDistances(row.edition.distances),
        image: row.edition.image,
        race: {
            id: row.race.id,
            name: row.race.name,
            slug: row.race.slug,
            description: row.race.description,
            image: row.race.image,
            place: row.race.place,
            finalPlace: computeFinalPlace(row.race.place, racePlaces),
            discipline: { id: row.discipline.id, name: row.discipline.name },
            links: raceLinks.map((l) => ({
                id: l.id,
                type: l.type,
                title: l.title,
                url: l.url,
            })),
            places: racePlaces,
        },
    };
}
