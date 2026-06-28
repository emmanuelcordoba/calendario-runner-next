'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordAction } from '@/actions/auth';

export default function ForgotPasswordPage() {
    const [state, action, pending] = useActionState(forgotPasswordAction, null);

    return (
        <div>
            <h1 className="mb-1 text-2xl font-bold">Recuperar contraseña</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Ingresá tu email y te enviaremos un enlace para resetear tu contraseña.
            </p>

            {state?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
                    {state.success}
                </div>
            )}

            {state?.error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {state.error}
                </div>
            )}

            <form action={action} className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        placeholder="email@ejemplo.com"
                    />
                </div>

                <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Enviar enlace
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Volver al inicio de sesión
                </Link>
            </p>
        </div>
    );
}
