import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: 'Calendario Runner',
        template: '%s | Calendario Runner',
    },
    description: 'Agenda argentina de carreras de calle y montaña.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
