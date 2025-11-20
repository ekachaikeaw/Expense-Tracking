import { Request, Response } from "express";
import { NewTransaction } from "../db/schema";
import * as transactionService from "../services/transactionService.js";
import { responseWithJSON } from "../utils/resJson";

export async function createTransaction(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
        responseWithJSON(res, 400, {
            message: "User not found",
        });
        return;
    }

    // When using multipart/form-data, req.body contains strings.
    // We need to parse them into the correct types for the database.
    const {
        accountId,
        categoryId,
        transactionType,
        amount,
        transactionDate,
        transactionTime,
        note,
        referenceNumber,
    } = req.body;

    const newTransaction: NewTransaction = {
        accountId: parseInt(accountId, 10),
        categoryId: parseInt(categoryId, 10),
        transactionType,
        amount,
        transactionDate,
        transactionTime,
        note,
        referenceNumber,
    };

    const createdTransaction = await transactionService.createTransaction(
        newTransaction,
        req.file,
    );

    responseWithJSON(res, 201, {
        message: "Transaction created successfully",
        data: createdTransaction,
    });
}

export async function getMonthlySummary(req: Request, res: Response) {
    const summary = await transactionService.getMonthlySummary();
    if (!summary) {
        responseWithJSON(res, 500, {
            message: "Failed to get monthly summary",
        });
        return;
    }
    responseWithJSON(res, 200, {
        message: "Monthly summary retrieved successfully",
        data: summary,
    });
}

export async function getCategoriesSummary(req: Request, res: Response) {
    const type = req.query?.type;
    const typeString = type as string;
    const summary = await transactionService.getCategoriesSummary(typeString);
    if (!summary) {
        responseWithJSON(res, 500, {
            message: "Failed to get categories summary",
        });
        return;
    }
    responseWithJSON(res, 200, {
        message: "Categories summary retrieved successfully",
        data: summary,
    });
}

export async function getTransactionSummary(req: Request, res: Response) {
    const { year, month, transactionType, accountId } = req.query;

    const filters = {
        year: year ? parseInt(year as string, 10) : undefined,
        month: month ? parseInt(month as string, 10) : undefined,
        transactionType: transactionType as any,
        accountId: accountId ? parseInt(accountId as string, 10) : undefined,
    };

    const result = await transactionService.getTransactionSummary(filters);
    responseWithJSON(res, 200, {
        message: "Transaction summary retrieved successfully",
        data: result,
    });
}
