'use client';

import { useActionState, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createPlaceAction } from '@/actions/places';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Province, Locality } from '@/lib/db/schema';

interface Props {
    races: { id: number; name: string }[];
    provinces: Province[];
    localities: Locality[];
    defaultRaceId?: number;
}

export default function PlaceForm({ races, provinces, localities, defaultRaceId }: Props) {
    const [state, formAction, pending] = useActionState(createPlaceAction, null);
    const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

    const filteredLocalities = selectedProvince
        ? localities.filter((l) => l.provinceId === selectedProvince)
        : [];

    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-lg">
            {defaultRaceId && <input type="hidden" name="redirect_to" value={`/admin/carreras/${defaultRaceId}`} />}
            {state?.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>}

            <div className="grid gap-2">
                <Label htmlFor="race_id">Carrera</Label>
                <select id="race_id" name="race_id" required defaultValue={defaultRaceId}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Seleccioná una carrera</option>
                    {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="province_id">Provincia</Label>
                <select id="province_id" name="province_id" required
                    onChange={(e) => setSelectedProvince(Number(e.target.value) || null)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Seleccioná una provincia</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="locality_id">Localidad (opcional)</Label>
                <select id="locality_id" name="locality_id"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Sin localidad específica</option>
                    {filteredLocalities.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="place">Descripción del lugar (opcional)</Label>
                <Input id="place" name="place" placeholder="Ej: Parque Sarmiento" />
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Crear lugar
                </Button>
                <Link href="/admin/lugares" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Cancelar</Link>
            </div>
        </form>
    );
}
