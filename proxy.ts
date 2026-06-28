import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

    if (nextUrl.pathname.startsWith('/admin')) {
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
    matcher: ['/admin/:path*', '/perfil/:path*'],
};
