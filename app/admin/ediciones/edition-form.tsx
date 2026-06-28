'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createEditionAction, updateEditionAction } from '@/actions/editions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Edition } from '@/lib/db/schema';

interface Race { id: number; name: string }

interface Props {
    edition?: Edition;
    races: Race[];
    defaultRaceId?: number;
}

export default function EditionForm({ edition, races, defaultRaceId }: Props) {
    const action = edition ? updateEditionAction : createEditionAction;
    const [state, formAction, pending] = useActionState(action, null);

    let distances = '';
    if (edition?.distances) {
        try { distances = JSON.parse(edition.distances).join(', '); } catch { distances = ''; }
    }

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-lg">
            {edition && <input type="hidden" name="id" value={edition.id} />}
            {defaultRaceId && !edition && <input type="hidden" name="redirect_to" value={`/admin/carreras/${defaultRaceId}`} />}
            {state?.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>}

            <div className="grid gap-2">
                <Label htmlFor="race_id">Carrera</Label>
                <select id="race_id" name="race_id" required defaultValue={edition?.raceId ?? defaultRaceId}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Seleccioná una carrera</option>
                    {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="start_date">Fecha inicio</Label>
                    <Input id="start_date" name="start_date" type="date" required defaultValue={edition?.startDate} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="end_date">Fecha fin</Label>
                    <Input id="end_date" name="end_date" type="date" required defaultValue={edition?.endDate} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="distances">Distancias (separadas por coma)</Label>
                <Input id="distances" name="distances" placeholder="21km, 42km, 70km" defaultValue={distances} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">URL de imagen</Label>
                <Input id="image" name="image" type="url" defaultValue={edition?.image ?? ''} placeholder="https://..." />
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {edition ? 'Guardar cambios' : 'Crear edición'}
                </Button>
                <Link href="/admin/ediciones" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Cancelar</Link>
            </div>
        </form>
    );
}
