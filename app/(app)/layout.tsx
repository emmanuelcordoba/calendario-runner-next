export const dynamic = 'force-dynamic';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';

export default async function AppLayout({ children }: PropsWithChildren) {
    const session = await auth();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <Link href="/" className="text-lg font-bold">
                        Calendario Runner
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">{session?.user?.name}</span>
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="text-foreground/80 transition-colors hover:text-foreground"
                            >
                                Salir
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        </div>
    );
}
