import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default {
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: process.env.TURSO_DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'turso',
    dbCredentials: process.env.TURSO_DATABASE_URL?.startsWith('file:')
        ? { url: process.env.TURSO_DATABASE_URL! }
        : { url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN },
} satisfies Config;
