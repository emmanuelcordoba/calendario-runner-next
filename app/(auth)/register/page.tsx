'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { registerAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
    const [state, action, pending] = useActionState(registerAction, null);

    return (
        <div>
            <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Completá los datos para registrarte.
            </p>

            {state?.error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {state.error}
                </div>
            )}

            <form action={action} className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        placeholder="Tu nombre"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="email@ejemplo.com"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                    <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Crear cuenta
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                    Iniciá sesión
                </Link>
            </p>
        </div>
    );
}
