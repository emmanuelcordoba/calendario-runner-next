'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Opcion {
    id: number;
    name: string;
}

interface Props {
    q: string;
    disciplineId: string;
    provinceId: string;
    size: string;
    disciplinas: Opcion[];
    provincias: Opcion[];
}

export default function Filters({
    q,
    disciplineId,
    provinceId,
    size,
    disciplinas,
    provincias,
}: Props) {
    const router = useRouter();
    const [values, setValues] = useState({ q, disciplineId, provinceId });

    const hayFiltros = !!(values.q || values.disciplineId || values.provinceId);

    const buscar = (v: typeof values) => {
        const params = new URLSearchParams();
        if (v.q.trim()) params.set('q', v.q.trim());
        if (v.disciplineId) params.set('discipline', v.disciplineId);
        if (v.provinceId) params.set('province', v.provinceId);
        params.set('size', size);
        // Siempre vuelve a la primera página: con otro filtro, la página en la
        // que estabas puede no existir.
        params.set('page', '1');
        router.push(`/admin/carreras?${params}`);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                buscar(values);
            }}
            className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
        >
            <div className="min-w-56 flex-1 space-y-1">
                <label htmlFor="q" className="block text-sm font-medium text-muted-foreground">
                    Nombre
                </label>
                <input
                    type="search"
                    id="q"
                    value={values.q}
                    onChange={(e) => setValues((v) => ({ ...v, q: e.target.value }))}
                    placeholder="Buscar por nombre…"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="discipline"
                    className="block text-sm font-medium text-muted-foreground"
                >
                    Disciplina
                </label>
                <select
                    id="discipline"
                    value={values.disciplineId}
                    onChange={(e) => setValues((v) => ({ ...v, disciplineId: e.target.value }))}
                    className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">Todas</option>
                    {disciplinas.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="province"
                    className="block text-sm font-medium text-muted-foreground"
                >
                    Provincia
                </label>
                <select
                    id="province"
                    value={values.provinceId}
                    onChange={(e) => setValues((v) => ({ ...v, provinceId: e.target.value }))}
                    className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">Todas</option>
                    {provincias.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Buscar
            </button>

            {hayFiltros && (
                <button
                    type="button"
                    onClick={() => {
                        const vacio = { q: '', disciplineId: '', provinceId: '' };
                        setValues(vacio);
                        buscar(vacio);
                    }}
                    className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Limpiar
                </button>
            )}
        </form>
    );
}
