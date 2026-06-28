'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { updateProfileAction } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfileForm({ name, email }: { name: string; email: string }) {
    const [state, action, pending] = useActionState(updateProfileAction, null);

    return (
        <form action={action} className="flex flex-col gap-4 max-w-sm">
            {state?.success && (
                <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
            )}
            {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={name} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={email} required />
            </div>
            <Button type="submit" disabled={pending} className="w-fit">
                {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Guardar cambios
            </Button>
        </form>
    );
}
