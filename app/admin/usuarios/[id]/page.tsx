export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import UserForm from '../user-form';

interface Props { params: Promise<{ id: string }> }

export default async function EditarUsuarioPage({ params }: Props) {
    const { id } = await params;
    const user = await db.select({ id: users.id, name: users.name, email: users.email, isAdmin: users.isAdmin }).from(users).where(eq(users.id, Number(id))).get();
    if (!user) notFound();
    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Editar usuario</h1>
            <UserForm user={user} />
        </div>
    );
}
