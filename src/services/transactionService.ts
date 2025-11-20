import * as transactionRepo from "../repositories/transactionRepo.js";
import { NewTransaction } from "../db/schema";
import {
    TransactionSummaryFilters,
    transactionType,
} from "../repositories/transactionRepo.js";
export async function createTransaction(
    transaction: NewTransaction,
    file?: Express.Multer.File,
) {
    const result = await transactionRepo.createTransaction(transaction);
    if (!result) {
        throw new Error("Failed to create transaction");
    }

    if (file) {
        const attachment = {
            transactionId: result.id,
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
        };
        await transactionRepo.createTransactionAttachment(attachment)
    }
    return result;
}

export async function getMonthlySummary() {
    const result = await transactionRepo.getMonthlySummary();
    if (!result) {
        throw new Error("Failed to get monthly summary");
    }
    return result;
}

export async function getCategoriesSummary(type: string) {
    const result = await transactionRepo.getCategorySummary(
        type as transactionType,
    );
    if (!result) {
        throw new Error("Failed to get categories summary");
    }
    return result;
}

export async function getTransactionSummary(
    filters: TransactionSummaryFilters,
) {
    const result = await transactionRepo.getTransactionSummary(filters);

    if (!result) {
        throw new Error("Failed to get transaction summary");
    }
    return result;
}
