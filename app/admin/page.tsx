import { db } from '@/lib/db';
import { editions, races, users } from '@/lib/db/schema';
import { count } from 'drizzle-orm';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminDashboard() {
    const [[racesCount], [editionsCount], [usersCount]] = await Promise.all([
        db.select({ count: count() }).from(races),
        db.select({ count: count() }).from(editions),
        db.select({ count: count() }).from(users),
    ]);

    const stats = [
        { label: 'Carreras', value: racesCount.count, href: '/admin/carreras' },
        { label: 'Ediciones', value: editionsCount.count, href: '/admin/ediciones' },
        { label: 'Usuarios', value: usersCount.count, href: '/admin/usuarios' },
    ];

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Link
                        key={stat.href}
                        href={stat.href}
                        className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent/40"
                    >
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
