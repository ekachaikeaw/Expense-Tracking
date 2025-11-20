import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { NewUser, users } from "../db/schema.js";

export async function create(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getByEmail(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    return result;
}

export async function getById(id: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
    return result;
}
