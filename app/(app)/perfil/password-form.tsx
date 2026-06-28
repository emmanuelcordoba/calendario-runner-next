'use client';

import { useActionState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { updatePasswordAction } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PasswordForm() {
    const [state, action, pending] = useActionState(updatePasswordAction, null);

    return (
        <form action={action} className="flex flex-col gap-4 max-w-sm">
            {state?.success && (
                <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
            )}
            {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="grid gap-2">
                <Label htmlFor="current_password">Contraseña actual</Label>
                <Input id="current_password" name="current_password" type="password" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" name="password" type="password" required placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
                <Input id="password_confirmation" name="password_confirmation" type="password" required />
            </div>
            <Button type="submit" disabled={pending} className="w-fit">
                {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Actualizar contraseña
            </Button>
        </form>
    );
}
