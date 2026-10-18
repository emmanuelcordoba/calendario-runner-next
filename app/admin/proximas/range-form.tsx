'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
    from: string;
    to: string;
    /** El rango por defecto, para poder volver a él sin recargar a mano. */
    defaultFrom: string;
    defaultTo: string;
}

export default function RangeForm({ from, to, defaultFrom, defaultTo }: Props) {
    const router = useRouter();
    const [values, setValues] = useState({ from, to });

    const buscar = (desde: string, hasta: string) => {
        router.push(`/admin/proximas?${new URLSearchParams({ from: desde, to: hasta })}`);
    };

    const enDefecto = values.from === defaultFrom && values.to === defaultTo;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                buscar(values.from, values.to);
            }}
            className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
        >
            <div className="space-y-1">
                <label htmlFor="from" className="block text-sm font-medium text-muted-foreground">
                    Desde
                </label>
                <input
                    type="date"
                    id="from"
                    value={values.from}
                    onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))}
                    required
                    className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="to" className="block text-sm font-medium text-muted-foreground">
                    Hasta
                </label>
                <input
                    type="date"
                    id="to"
                    value={values.to}
                    min={values.from}
                    onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
                    required
                    className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>

            <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Buscar
            </button>

            {!enDefecto && (
                <button
                    type="button"
                    onClick={() => {
                        setValues({ from: defaultFrom, to: defaultTo });
                        buscar(defaultFrom, defaultTo);
                    }}
                    className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Próximas dos semanas
                </button>
            )}
        </form>
    );
}
