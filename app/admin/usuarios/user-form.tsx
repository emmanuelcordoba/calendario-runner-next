'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { createUserAction, updateUserAction } from '@/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserData { id: number; name: string; email: string; isAdmin: boolean | null }

export default function UserForm({ user }: { user?: UserData }) {
    const action = user ? updateUserAction : createUserAction;
    const [state, formAction, pending] = useActionState(action, null);
    return (
        <form action={formAction} className="flex flex-col gap-4 max-w-lg">
            {user && <input type="hidden" name="id" value={user.id} />}
            {state?.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>}
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required defaultValue={user?.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required defaultValue={user?.email} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Contraseña {user && '(dejar vacío para no cambiar)'}</Label>
                <Input id="password" name="password" type="password" required={!user} placeholder="••••••••" />
            </div>
            <div className="flex items-center gap-2">
                <input id="is_admin" name="is_admin" type="checkbox" defaultChecked={user?.isAdmin ?? false} className="h-4 w-4 rounded border" />
                <Label htmlFor="is_admin">Es administrador</Label>
            </div>
            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {user ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
                <Link href="/admin/usuarios" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Cancelar</Link>
            </div>
        </form>
    );
}
