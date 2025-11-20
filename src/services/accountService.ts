import * as accountRepo from "../repositories/accountRepo";
import { NotFoundError } from "../utils/errors";
import { NewAccount } from "../db/schema";

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
