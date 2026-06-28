'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createLinkAction } from '@/actions/links';
import { LINK_TYPES } from '@/lib/link-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LinkForm({ races, defaultRaceId }: { races: { id: number; name: string }[]; defaultRaceId?: number }) {
    const [state, formAction, pending] = useActionState(createLinkAction, null);
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
                <Label htmlFor="type">Tipo</Label>
                <select id="type" name="type" required
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Seleccioná un tipo</option>
                    {LINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://..." />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input id="title" name="title" placeholder="Texto alternativo" />
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Crear link
                </Button>
                <Link href="/admin/links" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Cancelar</Link>
            </div>
        </form>
    );
}
