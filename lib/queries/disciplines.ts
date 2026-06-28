import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disciplines } from '@/lib/db/schema';

export async function getAllDisciplines() {
    return db.select().from(disciplines).orderBy(asc(disciplines.name));
}
