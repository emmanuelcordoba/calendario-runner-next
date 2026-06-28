export const dynamic = 'force-dynamic';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/carreras', label: 'Carreras' },
    { href: '/admin/ediciones', label: 'Ediciones' },
    { href: '/admin/lugares', label: 'Lugares' },
    { href: '/admin/localidades', label: 'Localidades' },
    { href: '/admin/links', label: 'Links' },
    { href: '/admin/usuarios', label: 'Usuarios' },
];

export default async function AdminLayout({ children }: PropsWithChildren) {
    const session = await auth();

    return (
        <div className="flex min-h-screen">
            <aside className="w-56 shrink-0 border-r bg-card px-3 py-6">
                <Link href="/admin" className="mb-6 block px-3 text-lg font-bold">
                    Admin
                </Link>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-8 border-t pt-4 px-3">
                    <p className="text-xs text-muted-foreground">{session?.user?.name}</p>
                    <form action={logoutAction} className="mt-2">
                        <button
                            type="submit"
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Salir
                        </button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 px-6 py-6">{children}</main>
        </div>
    );
}
