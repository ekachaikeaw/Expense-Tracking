import * as accountRepo from "../repositories/accountRepo.js";
import { NotFoundError } from "../utils/errors.js";
import { NewAccount } from "../db/schema.js";

export async function createAccount(account: NewAccount) {
    const newAccount = await accountRepo.createAccount(account);
    return newAccount;
}

export async function deleteAccount(id: number) {
    const deletedAccount = await accountRepo.deleteAccount(id);
    if (!deletedAccount) {
        throw new NotFoundError("Account not found");
    }
    return deletedAccount;
}

export async function getAccountById(id: number) {
    const account = await accountRepo.getAccountById(id);
    if (!account) {
        throw new NotFoundError("Account not found");
    }
    return account;
}
