import { PropsWithChildren } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight transition-opacity hover:opacity-80"
                    >
                        Calendario Runner
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
