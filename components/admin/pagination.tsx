'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const PAGE_SIZES = [10, 20, 50, 100];

interface Props {
    page: number;
    total: number;
    pageSize: number;
    basePath: string;
}

export default function Pagination({ page, total, pageSize, basePath }: Props) {
    const totalPages = Math.ceil(total / pageSize);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const buildHref = (p: number, s: number = pageSize) =>
        `${basePath}?page=${p}&size=${s}`;

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(e.target.value);
        router.push(buildHref(1, newSize));
    };

    const prev = page > 1 ? page - 1 : null;
    const next = page < totalPages ? page + 1 : null;

    return (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <select
                    value={pageSize}
                    onChange={handleSizeChange}
                    className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <span className="ml-2">
                    {total === 0
                        ? 'Sin registros'
                        : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total}`}
                </span>
            </div>

            {totalPages > 1 && (
                <div className="flex gap-2">
                    {prev ? (
                        <Link
                            href={buildHref(prev)}
                            className="rounded-md border px-3 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            ← Anterior
                        </Link>
                    ) : (
                        <span className="rounded-md border px-3 py-1 opacity-40">← Anterior</span>
                    )}
                    <span className="rounded-md border px-3 py-1">
                        {page} / {totalPages}
                    </span>
                    {next ? (
                        <Link
                            href={buildHref(next)}
                            className="rounded-md border px-3 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                            Siguiente →
                        </Link>
                    ) : (
                        <span className="rounded-md border px-3 py-1 opacity-40">Siguiente →</span>
                    )}
                </div>
            )}
        </div>
    );
}
