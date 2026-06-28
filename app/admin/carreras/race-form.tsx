'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createRaceAction, updateRaceAction } from '@/actions/races';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Race, Discipline } from '@/lib/db/schema';

interface Props {
    race?: Race;
    disciplines: Discipline[];
}

export default function RaceForm({ race, disciplines }: Props) {
    const action = race ? updateRaceAction : createRaceAction;
    const [state, formAction, pending] = useActionState(action, null);

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-lg">
            {race && <input type="hidden" name="id" value={race.id} />}

            {state?.error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {state.error}
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required defaultValue={race?.name} />
            </div>

            {race && (
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input id="slug" name="slug" required defaultValue={race.slug} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="discipline_id">Disciplina</Label>
                <select
                    id="discipline_id"
                    name="discipline_id"
                    required
                    defaultValue={race?.disciplineId}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <option value="">Seleccioná una disciplina</option>
                    {disciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={race?.description ?? ''}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">URL de imagen</Label>
                <Input id="image" name="image" type="url" defaultValue={race?.image ?? ''} placeholder="https://..." />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="place">Lugar (texto libre)</Label>
                <Input id="place" name="place" defaultValue={race?.place ?? ''} />
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {race ? 'Guardar cambios' : 'Crear carrera'}
                </Button>
                <Link
                    href="/admin/carreras"
                    className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    );
}
