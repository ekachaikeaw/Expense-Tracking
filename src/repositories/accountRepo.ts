import { eq } from "drizzle-orm";
import { db } from "../db";
import { accounts, NewAccount } from "../db/schema";

export async function createAccount(account: NewAccount) {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
}

export async function getAccountByName(name: string) {
    const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.name, name))
        .limit(1);
    return account;
}

export async function deleteAccount(id: number) {
    const [deletedAccount] = await db
        .delete(accounts)
        .where(eq(accounts.id, id))
        .returning();
    return deletedAccount;
}

export async function getAccountById(id: number) {
    const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1);
    return account;
}
