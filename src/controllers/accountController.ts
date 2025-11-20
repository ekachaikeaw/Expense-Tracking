import { Request, Response } from "express";
import * as accountService from "../services/accountService";
import { responseWithJSON, responseWithError } from "../utils/resJson";
import { NewAccount } from "../db/schema";

export async function createAccount(req: Request, res: Response) {
    const newAccountData: NewAccount = req.body;
    if (!req.user || !req.user.id) {
        return responseWithError(res, 401, "Unauthorized");
    }
    const createdAccount = await accountService.createAccount({ ...newAccountData, userId: req.user.id });
    responseWithJSON(res, 201, {
        message: "Account created successfully",
        data: createdAccount,
    });
}

export async function deleteAccount(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        return responseWithError(res, 400, "Account ID is required");
    }
    const deletedAccount = await accountService.deleteAccount(+id);
    responseWithJSON(res, 200, {
        message: "Account deleted successfully",
        data: deletedAccount,
    });
}
