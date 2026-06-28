import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disciplines, races } from '@/lib/db/schema';

export async function getAllRaces() {
    return db
        .select({ race: races, discipline: disciplines })
        .from(races)
        .innerJoin(disciplines, eq(races.disciplineId, disciplines.id))
        .orderBy(asc(races.name));
}

export async function getRaceById(id: number) {
    return db.select().from(races).where(eq(races.id, id)).get();
}
