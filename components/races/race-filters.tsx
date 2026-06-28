'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Discipline {
    id: number;
    name: string;
}

interface Props {
    from: string;
    to: string;
    disciplineId: string;
    disciplines: Discipline[];
}

export default function RaceFilters({ from, to, disciplineId, disciplines }: Props) {
    const router = useRouter();
    const [values, setValues] = useState({ from, to, discipline: disciplineId });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams({
            from: values.from,
            to: values.to,
            discipline: values.discipline,
        });
        router.push(`/?${params.toString()}`);
    };

    return (
        <form
            onSubmit={submit}
            className="grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 md:grid-cols-2"
        >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <label htmlFor="from" className="text-sm font-medium text-muted-foreground">
                        Desde
                    </label>
                    <input
                        type="date"
                        id="from"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                        value={values.from}
                        onChange={(e) => setValues((v) => ({ ...v, from: e.target.value }))}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="to" className="text-sm font-medium text-muted-foreground">
                        Hasta
                    </label>
                    <input
                        type="date"
                        id="to"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                        value={values.to}
                        onChange={(e) => setValues((v) => ({ ...v, to: e.target.value }))}
                        required
                    />
                </div>
            </div>
            <div className="flex items-end gap-3">
                <div className="w-full space-y-1">
                    <label htmlFor="discipline" className="text-sm font-medium text-muted-foreground">
                        Disciplina
                    </label>
                    <select
                        id="discipline"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                        value={values.discipline}
                        onChange={(e) => setValues((v) => ({ ...v, discipline: e.target.value }))}
                    >
                        <option value="all">Todas</option>
                        {disciplines.map((d) => (
                            <option value={d.id} key={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Buscar
                </button>
            </div>
        </form>
    );
}
