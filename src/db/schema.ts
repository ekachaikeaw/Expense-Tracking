import {
    pgTable,
    uuid,
    timestamp,
    varchar,
    boolean,
    serial,
    pgEnum,
    decimal,
    integer,
    text,
    date,
    time,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 256 })
        .notNull()
        .default("unset"),
});

export const accountTypeEnum = pgEnum("account_type", [
    "cash",
    "bank",
    "credit_card",
    "e_wallet",
]);

export const accounts = pgTable("accounts", {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    name: varchar("name", { length: 100 }).notNull(),
    type: accountTypeEnum("type").notNull(),
    balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    type: categoryTypeEnum("type").notNull(),
    parentCategoryId: integer("parent_category_id"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const transactionTypeEnum = pgEnum("transaction_type", [
    "income",
    "expense",
    "transfer",
]);

export const transactions = pgTable(
    "transactions",
    {
        id: serial("id").primaryKey(),
        accountId: integer("account_id")
            .notNull()
            .references(() => accounts.id),
        categoryId: integer("category_id")
            .notNull()
            .references(() => categories.id),
        transactionType: transactionTypeEnum("transaction_type").notNull(),
        amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
        transactionDate: date("transaction_date").notNull().defaultNow(),
        transactionTime: time("transaction_time").defaultNow(),
        note: text("note"),
        referenceNumber: varchar("reference_number", { length: 50 }),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return {
            dateIndex: index("idx_date").on(table.transactionDate),
            accountDateIndex: index("idx_account_date").on(
                table.accountId,
                table.transactionDate,
            ),
            categoryDateIndex: index("idx_category_date").on(
                table.categoryId,
                table.transactionDate,
            ),
        };
    },
);

export const transactionAttachments = pgTable(
    "transaction_attachments",
    {
        id: serial("id").primaryKey(),
        transactionId: integer("transaction_id")
            .notNull()
            .references(() => transactions.id, { onDelete: "cascade" }),
        fileName: varchar("file_name", { length: 255 }).notNull(),
        filePath: varchar("file_path", { length: 500 }).notNull(),
        fileType: varchar("file_type", { length: 50 }),
        fileSize: integer("file_size"),
        uploadedAt: timestamp("uploaded_at").defaultNow(),
    },
    (table) => {
        return {
            transactionIndex: index("idx_transaction").on(table.transactionId),
        };
    },
);

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parentCategory: one(categories, {
        fields: [categories.parentCategoryId],
        references: [categories.id],
        relationName: "parent_category",
    }),
    subCategories: many(categories, {
        relationName: "parent_category",
    }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(
    transactions,
    ({ one, many }) => ({
        account: one(accounts, {
            fields: [transactions.accountId],
            references: [accounts.id],
        }),
        category: one(categories, {
            fields: [transactions.categoryId],
            references: [categories.id],
        }),
        attachments: many(transactionAttachments),
    }),
);

export const transactionAttachmentsRelations = relations(
    transactionAttachments,
    ({ one }) => ({
        transaction: one(transactions, {
            fields: [transactionAttachments.transactionId],
            references: [transactions.id],
        }),
    }),
);

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransactionAttachment =
    typeof transactionAttachments.$inferInsert;
export type TransactionAttachment = typeof transactionAttachments.$inferSelect;
