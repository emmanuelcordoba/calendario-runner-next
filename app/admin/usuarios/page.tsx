import Link from 'next/link';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { deleteUserAction } from '@/actions/users';
import DeleteButton from '@/components/admin/delete-button';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Usuarios - Admin' };

export default async function AdminUsuariosPage() {
    const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, isAdmin: users.isAdmin, createdAt: users.createdAt }).from(users).orderBy(asc(users.name));

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Usuarios</h1>
                <Link href="/admin/usuarios/nuevo" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Nuevo usuario</Link>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Nombre</th>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            <th className="px-4 py-3 text-left font-medium">Admin</th>
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {allUsers.map((user) => (
                            <tr key={user.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                <td className="px-4 py-3 text-muted-foreground">{user.isAdmin ? 'Sí' : 'No'}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/usuarios/${user.id}`} className="text-primary underline-offset-4 hover:underline">Editar</Link>
                                        <DeleteButton action={deleteUserAction} message="¿Eliminar usuario?">
                                            <input type="hidden" name="id" value={user.id} />
                                            <button type="submit" className="text-destructive underline-offset-4 hover:underline">Eliminar</button>
                                        </DeleteButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {allUsers.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay usuarios.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
