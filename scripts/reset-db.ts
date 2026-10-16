import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@libsql/client';

config({ path: resolve(process.cwd(), '.env.local') });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

// Datos del catálogo: se vacían y se vuelven a cargar desde scripts/data/.
// En orden hijo → padre para no pelear con las foreign keys.
const dataTables = [
    'links',
    'places',
    'editions',
    'races',
    'disciplines',
    'localities',
    'provinces',
];

// Cuentas: no se tocan. Resetear el catálogo no debería dejarte sin acceso a
// /admin, y el seed no crea ningún usuario.
const accountTables = ['password_reset_tokens', 'users'];

// Se vacían las tablas en vez de borrarlas a propósito. Si se borran, el
// `drizzle-kit push` que viene después las recrea, pero emite dos veces el
// CREATE UNIQUE INDEX de las tablas que sí sobrevivieron y falla; y como
// db:reset encadena con &&, el seed no llega a correr. Vaciando, el schema
// queda igual, el push no tiene nada que hacer y las cuentas quedan intactas.
const wipeAll = process.argv.includes('--all');

async function reset() {
    await client.execute('PRAGMA foreign_keys = OFF');

    if (wipeAll) {
        console.log('🗑  Borrando TODAS las tablas, cuentas incluidas...');
        for (const table of [...dataTables, ...accountTables]) {
            await client.execute(`DROP TABLE IF EXISTS "${table}"`);
            console.log(`  borrada ${table}`);
        }
        await client.execute('PRAGMA foreign_keys = ON');
        console.log('⚠  Las cuentas se fueron: después del seed hay que crear el admin a mano (ver README).');
        console.log('✅ Tablas borradas. Siguen db:push y seed.');
        process.exit(0);
    }

    console.log('🧹 Vaciando los datos del catálogo...');
    for (const table of dataTables) {
        const existe = await client.execute({
            sql: "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?",
            args: [table],
        });
        if (!Number(existe.rows[0].n)) {
            console.log(`  ${table} todavía no existe, la crea db:push`);
            continue;
        }
        const antes = await client.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
        await client.execute(`DELETE FROM "${table}"`);
        // reinicia el AUTOINCREMENT para que los ids vuelvan a empezar en 1
        await client.execute({ sql: 'DELETE FROM sqlite_sequence WHERE name = ?', args: [table] });
        console.log(`  vaciada ${table} (${antes.rows[0].n} filas)`);
    }
    await client.execute('PRAGMA foreign_keys = ON');

    const hayUsers = await client.execute(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'users'",
    );
    if (Number(hayUsers.rows[0].n)) {
        const users = await client.execute('SELECT COUNT(*) AS n FROM users');
        const admins = await client.execute('SELECT COUNT(*) AS n FROM users WHERE is_admin = 1');
        console.log(`  intactas ${accountTables.join(', ')} — ${users.rows[0].n} usuario(s), ${admins.rows[0].n} admin(s)`);
        if (!Number(admins.rows[0].n)) {
            console.log('  ⚠ no hay ningún admin: no vas a poder entrar a /admin (ver README)');
        }
    } else {
        console.log('  ⚠ no existe la tabla users: después del seed hay que crear el admin a mano (ver README)');
    }

    console.log('✅ Catálogo vacío. Sigue el seed.');
    process.exit(0);
}

reset().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
