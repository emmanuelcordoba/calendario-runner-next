import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import {
    provinces,
    localities,
    disciplines,
    races,
    editions,
    places,
    links,
} from '../lib/db/schema';

config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
const db = drizzle(client);

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

async function seed() {
    const rootDir = resolve(process.cwd(), 'scripts/data');

    const provincesData = JSON.parse(
        readFileSync(resolve(rootDir, 'provinces.json'), 'utf-8')
    ) as { provinces: { name: string; localities: { name: string }[] }[] };

    const racesData = JSON.parse(
        readFileSync(resolve(rootDir, 'races.json'), 'utf-8')
    ) as {
        disciplines: { name: string; description: string }[];
        races: {
            name: string;
            discipline: string;
            description: string | null;
            image: string | null;
            place: string | null;
            links: { type: string; url: string }[];
            places: { province: string; locality: string | null; place: string | null }[];
            editions: { start_date: string; end_date: string; distances: string[] }[];
        }[];
    };

    console.log('🌱 Seeding provinces and localities...');
    const provinceMap = new Map<string, number>();
    const localityMap = new Map<string, number>();

    for (const prov of provincesData.provinces) {
        const [inserted] = await db
            .insert(provinces)
            .values({ name: prov.name })
            .returning({ id: provinces.id });
        provinceMap.set(prov.name, inserted.id);

        for (const loc of prov.localities) {
            const [insertedLoc] = await db
                .insert(localities)
                .values({ name: loc.name, provinceId: inserted.id })
                .returning({ id: localities.id });
            localityMap.set(`${prov.name}::${loc.name}`, insertedLoc.id);
        }
    }
    console.log(`  ✓ ${provinceMap.size} provincias, ${localityMap.size} localidades`);

    console.log('🌱 Seeding disciplines...');
    const disciplineMap = new Map<string, number>();
    for (const disc of racesData.disciplines) {
        const [inserted] = await db
            .insert(disciplines)
            .values({ name: disc.name, description: disc.description })
            .returning({ id: disciplines.id });
        disciplineMap.set(disc.name, inserted.id);
    }
    console.log(`  ✓ ${disciplineMap.size} disciplinas`);

    console.log('🌱 Seeding races, editions, places and links...');
    let raceCount = 0;
    let skipped = 0;

    for (const raceData of racesData.races) {
        // Skip empty/placeholder entries
        if (!raceData.name || !raceData.discipline) {
            skipped++;
            continue;
        }

        const disciplineId = disciplineMap.get(raceData.discipline);
        if (!disciplineId) {
            console.warn(`  ⚠ Disciplina no encontrada: ${raceData.discipline}`);
            skipped++;
            continue;
        }

        const slug = slugify(raceData.name);
        const [race] = await db
            .insert(races)
            .values({
                name: raceData.name,
                slug,
                disciplineId,
                description: raceData.description || null,
                image: raceData.image || null,
            })
            .returning({ id: races.id });

        // Editions
        for (const ed of raceData.editions) {
            if (!ed.start_date || ed.start_date.includes('00')) continue;
            await db.insert(editions).values({
                raceId: race.id,
                startDate: ed.start_date,
                endDate: ed.end_date,
                distances: JSON.stringify(ed.distances),
            });
        }

        // Places
        for (const pl of raceData.places) {
            if (!pl.province) continue;

            // Try to find or create the province
            let provinceId = provinceMap.get(pl.province);
            if (!provinceId) {
                // Province not in seed data, create it
                const [newProv] = await db
                    .insert(provinces)
                    .values({ name: pl.province })
                    .returning({ id: provinces.id });
                provinceId = newProv.id;
                provinceMap.set(pl.province, provinceId);
            }

            let localityId: number | null = null;
            if (pl.locality) {
                const key = `${pl.province}::${pl.locality}`;
                localityId = localityMap.get(key) ?? null;
                if (!localityId) {
                    // Locality not in seed data, create it
                    const [newLoc] = await db
                        .insert(localities)
                        .values({ name: pl.locality, provinceId })
                        .returning({ id: localities.id });
                    localityId = newLoc.id;
                    localityMap.set(key, localityId);
                }
            }

            await db.insert(places).values({
                raceId: race.id,
                provinceId,
                localityId,
                place: pl.place || null,
            });
        }

        // Links
        for (const link of raceData.links) {
            if (!link.url) continue;
            await db.insert(links).values({
                raceId: race.id,
                type: link.type,
                url: link.url,
                title: null,
            });
        }

        raceCount++;
    }

    console.log(`  ✓ ${raceCount} carreras insertadas, ${skipped} omitidas`);
    console.log('✅ Seed completado.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
});
