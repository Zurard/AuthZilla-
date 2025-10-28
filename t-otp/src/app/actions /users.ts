'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';


export async function createUser(email: string, password: string) {
    return await 
    db.insert(users).values({
         email, 
         password 
        });
}

export async function ForgotPassword(email: string, newPassword: string) {
    return await
     db.update(users).
        set({ 
            password: newPassword 
        }).
        where(eq(users.email, email));
}

export async function getUserByEmail(email: string) {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0];
}

export async function getPasswordByEmail(email: string) {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0]?.password;
}