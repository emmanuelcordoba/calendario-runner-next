import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Contraseña', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email as string))
                    .get();

                if (!user) return null;

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password,
                );
                if (!passwordMatch) return null;

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.sub!;
            (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
});
