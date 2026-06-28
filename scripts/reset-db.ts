import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@libsql/client';

config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const tables = [
    'links',
    'places',
    'editions',
    'races',
    'disciplines',
    'localities',
    'provinces',
    'password_reset_tokens',
    'users',
];

async function reset() {
    console.log('🗑  Dropping all tables...');
    await client.execute('PRAGMA foreign_keys = OFF');
    for (const table of tables) {
        await client.execute(`DROP TABLE IF EXISTS "${table}"`);
        console.log(`  dropped ${table}`);
    }
    await client.execute('PRAGMA foreign_keys = ON');
    console.log('✅ Done. Now run: pnpm db:push && pnpm seed');
    process.exit(0);
}

reset().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
