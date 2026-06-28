'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createLocalityAction, updateLocalityAction } from '@/actions/localities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Locality } from '@/lib/db/schema';

interface Props { locality?: Locality; provinces: { id: number; name: string }[] }

export default function LocalityForm({ locality, provinces }: Props) {
    const action = locality ? updateLocalityAction : createLocalityAction;
    const [state, formAction, pending] = useActionState(action, null);
    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-lg">
            {locality && <input type="hidden" name="id" value={locality.id} />}
            {state?.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>}
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required defaultValue={locality?.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="province_id">Provincia</Label>
                <select id="province_id" name="province_id" required defaultValue={locality?.provinceId}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Seleccioná una provincia</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {locality ? 'Guardar cambios' : 'Crear localidad'}
                </Button>
                <Link href="/admin/localidades" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Cancelar</Link>
            </div>
        </form>
    );
}
