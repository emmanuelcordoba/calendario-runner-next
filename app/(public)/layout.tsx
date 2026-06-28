export const dynamic = 'force-dynamic';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import ThemeToggle from '@/components/theme-toggle';

export default async function PublicLayout({ children }: PropsWithChildren) {
    const session = await auth();
    const user = session?.user;
    const isAdmin = (user as { isAdmin?: boolean })?.isAdmin ?? false;

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex items-center justify-end gap-3 p-4 text-sm">
                <ThemeToggle />
                {user ? (
                    <>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-foreground/80 transition-colors hover:text-foreground"
                            >
                                Admin
                            </Link>
                        )}
                        <Link
                            href="/perfil"
                            className="text-foreground/80 transition-colors hover:text-foreground"
                        >
                            {user.name}
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-foreground/80 transition-colors hover:text-foreground"
                        >
                            Iniciar sesión
                        </Link>
                        {process.env.REGISTRATION_ENABLED === 'true' && (
                            <Link
                                href="/register"
                                className="text-foreground/80 transition-colors hover:text-foreground"
                            >
                                Registro
                            </Link>
                        )}
                    </>
                )}
            </div>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8">
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-block text-3xl font-bold tracking-tight transition-opacity hover:opacity-80"
                    >
                        Calendario Runner
                    </Link>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Agenda argentina de carreras de calle y montaña.
                    </p>
                </div>
                <div className="mx-auto mt-6 w-full max-w-3xl">{children}</div>
                <div className="mt-8 text-center">
                    <a
                        href="https://cafecito.app/emmanuelcordoba"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="inline-block"
                    >
                        <img
                            srcSet="https://cdn.cafecito.app/imgs/buttons/button_1.png 1x, https://cdn.cafecito.app/imgs/buttons/button_1_2x.png 2x"
                            src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
                            alt="Invitame un café en cafecito.app"
                        />
                    </a>
                </div>
            </main>

            <footer className="mt-4 pb-6 text-center text-sm">
                <a
                    href="https://emmanuelcordoba.com/"
                    className="text-foreground/80 transition-colors hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Desarrollado por Emmanuel Cordoba
                </a>
            </footer>
        </div>
    );
}
