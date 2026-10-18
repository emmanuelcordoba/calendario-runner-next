import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

    // /placa vive fuera de /admin para no heredar el layout del panel, pero es
    // una herramienta interna igual: se protege acá y además en la propia página.
    if (nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/placa')) {
        if (!isLoggedIn || !isAdmin) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
    }

    if (nextUrl.pathname.startsWith('/perfil')) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/placa/:path*', '/perfil/:path*'],
};
