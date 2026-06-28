import { auth } from '@/lib/auth';
import ProfileForm from './profile-form';
import PasswordForm from './password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mi perfil' };

export default async function PerfilPage() {
    const session = await auth();
    const user = session?.user;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Mi perfil</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Administrá tu información personal.
                </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Información personal</h2>
                <ProfileForm name={user?.name ?? ''} email={user?.email ?? ''} />
            </div>

            <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Cambiar contraseña</h2>
                <PasswordForm />
            </div>
        </div>
    );
}
