import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disciplines, races } from '@/lib/db/schema';

export async function getAllRaces() {
    return db
        .select({ race: races, discipline: disciplines })
        .from(races)
        .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
        .orderBy(asc(races.name));
}

export async function getRacesPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const [rows, countRow] = await Promise.all([
        db
            .select({ race: races, discipline: disciplines })
            .from(races)
            .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
            .orderBy(asc(races.name))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(races).get(),
    ]);
    return { rows, total: Number(countRow?.count ?? 0) };
}

export async function getRaceById(id: number) {
    return db.select().from(races).where(eq(races.id, id)).get();
}
