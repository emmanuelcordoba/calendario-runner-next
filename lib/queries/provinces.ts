import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { provinces } from '@/lib/db/schema';

export async function getAllProvinces() {
    return db.select().from(provinces).orderBy(asc(provinces.name));
}
