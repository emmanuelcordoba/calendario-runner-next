/**
 * Script de migración: MySQL (Laravel) → Turso (SQLite)
 *
 * Uso:
 * 1. Exportar tablas desde MySQL:
 *    mysqldump -u root -p calendario_runner --tab=/tmp/export --fields-terminated-by=','
 *    O usar TablePlus / phpMyAdmin para exportar a CSV
 *
 * 2. Poner los CSVs en scripts/data/ con nombres:
 *    provinces.csv, localities.csv, disciplines.csv, races.csv,
 *    editions.csv, places.csv, links.csv
 *
 * 3. Configurar TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env.local
 *
 * 4. Ejecutar:
 *    npx tsx scripts/migrate-from-mysql.ts
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../lib/db/schema';
import fs from 'fs';
import path from 'path';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

function readCsv(filename: string): Record<string, string>[] {
    const filePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  No se encontró ${filename}, saltando...`);
        return [];
    }
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
    });
}

async function migrate() {
    console.log('🚀 Iniciando migración...\n');

    // Provinces
    const provinces = readCsv('provinces.csv');
    if (provinces.length) {
        for (const p of provinces) {
            await db.insert(schema.provinces).values({ id: Number(p.id), name: p.name }).onConflictDoNothing();
        }
        console.log(`✅ Provincias: ${provinces.length}`);
    }

    // Localities
    const localities = readCsv('localities.csv');
    if (localities.length) {
        for (const l of localities) {
            await db.insert(schema.localities).values({ id: Number(l.id), name: l.name, provinceId: Number(l.province_id) }).onConflictDoNothing();
        }
        console.log(`✅ Localidades: ${localities.length}`);
    }

    // Disciplines
    const disciplines = readCsv('disciplines.csv');
    if (disciplines.length) {
        for (const d of disciplines) {
            await db.insert(schema.disciplines).values({ id: Number(d.id), name: d.name, description: d.description || null }).onConflictDoNothing();
        }
        console.log(`✅ Disciplinas: ${disciplines.length}`);
    }

    // Races
    const races = readCsv('races.csv');
    if (races.length) {
        for (const r of races) {
            await db.insert(schema.races).values({
                id: Number(r.id),
                name: r.name,
                slug: r.slug,
                disciplineId: Number(r.discipline_id),
                description: r.description || null,
                image: r.image || null,
                place: r.place || null,
            }).onConflictDoNothing();
        }
        console.log(`✅ Carreras: ${races.length}`);
    }

    // Editions
    const editions = readCsv('editions.csv');
    if (editions.length) {
        for (const e of editions) {
            await db.insert(schema.editions).values({
                id: Number(e.id),
                raceId: Number(e.race_id),
                startDate: e.start_date,
                endDate: e.end_date,
                distances: e.distances || '[]',
                image: e.image || null,
            }).onConflictDoNothing();
        }
        console.log(`✅ Ediciones: ${editions.length}`);
    }

    // Places
    const places = readCsv('places.csv');
    if (places.length) {
        for (const p of places) {
            await db.insert(schema.places).values({
                id: Number(p.id),
                raceId: Number(p.race_id),
                provinceId: Number(p.province_id),
                localityId: p.locality_id ? Number(p.locality_id) : null,
                place: p.place || null,
            }).onConflictDoNothing();
        }
        console.log(`✅ Lugares: ${places.length}`);
    }

    // Links
    const links = readCsv('links.csv');
    if (links.length) {
        for (const l of links) {
            await db.insert(schema.links).values({
                id: Number(l.id),
                raceId: Number(l.race_id),
                type: l.type,
                title: l.title || null,
                url: l.url || null,
            }).onConflictDoNothing();
        }
        console.log(`✅ Links: ${links.length}`);
    }

    console.log('\n✅ Migración completada.');
    process.exit(0);
}

migrate().catch((err) => {
    console.error('❌ Error en migración:', err);
    process.exit(1);
});
