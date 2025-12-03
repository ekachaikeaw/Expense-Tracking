import {
    categories,
    NewTransaction,
    NewTransactionAttachment,
    Transaction,
    transactionAttachments,
    transactions,
} from "../db/schema.js";
import { db } from "../db/index.js";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

export async function createTransaction(transaction: NewTransaction) {
    const [newTransaction] = await db
        .insert(transactions)
        .values(transaction)
        .returning();
    return newTransaction;
}

export async function createTransactionAttachment(
    attachment: NewTransactionAttachment,
) {
    const [newAttachment] = await db
        .insert(transactionAttachments)
        .values(attachment)
        .returning();
    return newAttachment;
}

export async function getMonthlySummary() {
    const result = await db
        .select({
            month: sql<string>`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`.as(
                "month",
            ),
            transactionType: transactions.transactionType,
            total: sql<string>`SUM(${transactions.amount})`.as("total"),
        })
        .from(transactions)
        .groupBy(
            sql`TO_CHAR(${transactions.transactionDate}, 'YYYY-MM')`,
            transactions.transactionType,
        );

    return result;
}

export type transactionType = "income" | "expense" | "transfer";
export async function getCategorySummary(type?: transactionType, limit?: number) {
    let result;
    if (type) {
        result = await db
            .select({
                categoryName: categories.name,
                total: sql<number>`SUM(${transactions.amount})`.as("total"),
            })
            .from(transactions)
            .innerJoin(
                categories,
                sql`${transactions.categoryId} = ${categories.id}`,
            )
            .where(eq(transactions.transactionType, type))
            .groupBy(categories.id)
            .limit(limit ?? 10);
    } else {
        result = await db
            .select({
                type: transactions.transactionType,
                categoryName: categories.name,
                total: sql<number>`SUM(${transactions.amount})`.as("total"),
            })
            .from(transactions)
            .innerJoin(
                categories,
                sql`${transactions.categoryId} = ${categories.id}`,
            )
            .groupBy(categories.id, transactions.transactionType);
    }

    return result;
}

export type TransactionSummaryFilters = {
    year?: number;
    month?: number;
    transactionType?: transactionType;
    accountId?: number;
};

export async function getTransactionSummary(
    filters: TransactionSummaryFilters,
) {
    const { year, month, transactionType, accountId } = filters;
    const conditions = [];

    if (year) {
        conditions.push(
            sql`extract(year from ${transactions.transactionDate}) = ${year}`,
        );
    }
    if (month) {
        conditions.push(
            sql`extract(month from ${transactions.transactionDate}) = ${month}`,
        );
    }
    if (transactionType) {
        conditions.push(eq(transactions.transactionType, transactionType));
    }
    if (accountId) {
        conditions.push(eq(transactions.accountId, accountId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const summaryByCategory = await db
        .select({
            categoryName: categories.name,
            total: sql<number>`SUM(${transactions.amount})`.as("total"),
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(where)
        .groupBy(categories.id);

    const totalResult = await db
        .select({
            total: sql<string>`SUM(${transactions.amount})`.as("total"),
        })
        .from(transactions)
        .where(where);

    return {
        summary: summaryByCategory,
        total: totalResult[0]?.total || "0.00",
    };
}

interface TransactionFilters {
    year?: number;
    month?: number;
    categoryId?: number;
    accountId?: number;
    page?: number; // หน้าที่ต้องการ (เริ่มจาก 1)
    perPage?: 10 | 20 | 50 | 100; // จำนวนต่อหน้า
}

interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
}

export async function getTransactions(
    filters: TransactionFilters = {},
): Promise<PaginatedResult<typeof transactions.$inferSelect>> {
    const conditions = [];

    // Filter by year and month
    if (filters.year !== undefined && filters.month !== undefined) {
        const startDate = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
        const lastDay = new Date(filters.year, filters.month, 0).getDate();
        const endDate = `${filters.year}-${String(filters.month).padStart(2, "0")}-${lastDay}`;
        conditions.push(
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate),
        );
    } else if (filters.year !== undefined) {
        // Filter by year only
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        conditions.push(
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate),
        );
    }

    // Filter by category
    if (filters.categoryId !== undefined) {
        conditions.push(eq(transactions.categoryId, filters.categoryId));
    }

    // Filter by account
    if (filters.accountId !== undefined) {
        conditions.push(eq(transactions.accountId, filters.accountId));
    }

    // Build and execute query
    const query = db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.transactionDate));

    // Apply filters if any exist
    // TODO: fix any type issues
    let baseQuery = query as any;
    if (conditions.length > 0) {
        baseQuery = query.where(and(...conditions));
    }

    // Pagination
    const page = filters.page || 1;
    const perPage = filters.perPage || 10;
    const offset = (page - 1) * perPage;

    // Get total count
    const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(transactions);

    const totalResult =
        conditions.length > 0
            ? await countQuery.where(and(...conditions))
            : await countQuery;

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / perPage);

    // Get paginated data
    const data = await baseQuery.limit(perPage).offset(offset);

    return {
        data,
        pagination: {
            page,
            perPage,
            total,
            totalPages,
        },
    };
}


interface CategorySummaryFilters {
  year?: number;
  month?: number;
  transactionType?: 'expense' | 'income';
}

interface CategorySummary {
  mainCategory: string;
  subCategory: string;
  totalAmount: number;
  transactionCount: number;
}

export async function getCategorySummary2(
  filters: CategorySummaryFilters = {}
): Promise<CategorySummary[]> {
  const conditions = [];

  // Filter by transaction type
  if (filters.transactionType) {
    conditions.push(eq(transactions.transactionType, filters.transactionType));
  }

  // Filter by year and month
  if (filters.year !== undefined && filters.month !== undefined) {
    const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    const lastDay = new Date(filters.year, filters.month, 0).getDate();
    const endDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-${lastDay}`;
    conditions.push(
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    );
  } else if (filters.year !== undefined) {
    // Filter by year only
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    conditions.push(
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate)
    );
  }

  // Create subquery for parent categories
  const parentCategories = db
    .select({
      id: categories.id,
      name: categories.name,
      parentCategoryId: categories.parentCategoryId
    })
    .from(categories)
    .as('parent');

  // Build the query
  const mainCategoryExpr = sql<string>`COALESCE(${parentCategories.name}, ${categories.name})`;
  const totalAmountExpr = sql<number>`SUM(${transactions.amount})`;

  const query = db
    .select({
      mainCategory: mainCategoryExpr,
      subCategory: categories.name,
      totalAmount: totalAmountExpr,
      transactionCount: sql<number>`COUNT(${transactions.id})`
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(parentCategories, eq(categories.parentCategoryId, parentCategories.id))
    .groupBy(mainCategoryExpr, categories.name)
    .orderBy(desc(totalAmountExpr));

  // Apply filters
  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}
