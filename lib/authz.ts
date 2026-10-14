import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export interface AdminSession {
    userId: number;
    name: string;
    email: string;
}

/**
 * Verifica que haya sesión activa y que el usuario siga siendo admin.
 *
 * El matcher de `proxy.ts` solo cubre las *páginas* de /admin. Una Server Action
 * hace POST a la ruta desde la que se la invoca, no a /admin, así que el proxy
 * no alcanza para protegerlas: este chequeo es el que cuenta y va como primera
 * línea de toda acción de admin.
 *
 * El flag `isAdmin` del JWT solo se refresca al iniciar sesión, por eso se
 * relee de la base: quitarle admin a alguien tiene efecto inmediato.
 */
export const verifyAdmin = cache(async (): Promise<AdminSession | null> => {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!userId) return null;

    const user = await db
        .select({ id: users.id, name: users.name, email: users.email, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, userId))
        .get();

    if (!user?.isAdmin) return null;

    return { userId: user.id, name: user.name, email: user.email };
});

/**
 * Igual que `verifyAdmin` pero corta la ejecución si no corresponde. Para las
 * acciones que no devuelven estado al formulario (`delete*`, `toggle*`), donde
 * retornar en silencio ocultaría el rechazo.
 */
export async function requireAdmin(): Promise<AdminSession> {
    const admin = await verifyAdmin();
    if (!admin) throw new Error('No autorizado.');
    return admin;
}
