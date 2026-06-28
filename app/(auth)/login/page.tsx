'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export default function LoginPage() {
    const [state, action, pending] = useActionState(loginAction, null);

    return (
        <div>
            <h1 className="mb-1 text-2xl font-bold">Iniciar sesión</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Ingresá tu email y contraseña para acceder.
            </p>

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

                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Contraseña</Label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Ingresar
                </Button>
            </form>

            {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    ¿No tenés cuenta?{' '}
                    <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                        Registrate
                    </Link>
                </p>
            )}
        </div>
    );
}
