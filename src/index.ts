import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import upload from "./configs/multerConfig.js";

import { asyncErrorWrapper } from "./utils/asyncErrorWrapper.js";
import * as usersController from "./controllers/usersController.js";
import * as accountsController from "./controllers/accountController.js";
import * as categoriesController from "./controllers/categoriesController.js";
import * as transactionsController from "./controllers/transactionController.js";

import { getTransactions } from "./repositories/transactionRepo.js";

import { handlerLogin } from "./controllers/loginController.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";
import { auth } from "./middlewares/authMiddleware.js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());

app.use("/", express.static("public"));

app.use("/healthz", (req, res) => {
    res.status(200).send("OK");
});

// Users Route
app.post(
    "/users",
    asyncErrorWrapper(usersController.create.bind(usersController)),
);
app.get(
    "/users",
    auth,
    asyncErrorWrapper(usersController.getByEmail.bind(usersController)),
);

// Login Route
app.post("/login", asyncErrorWrapper(handlerLogin));

// Accounts Route
app.post(
    "/accounts",
    auth,
    asyncErrorWrapper(
        accountsController.createAccount.bind(accountsController),
    ),
);
app.delete(
    "/accounts/:id",
    auth,
    asyncErrorWrapper(
        accountsController.deleteAccount.bind(accountsController),
    ),
);

// Categories Route
app.post(
    "/categories",
    auth,
    asyncErrorWrapper(
        categoriesController.createCategory.bind(categoriesController),
    ),
);

app.delete(
    "/categories/:id",
    auth,
    asyncErrorWrapper(
        categoriesController.deleteCategory.bind(categoriesController),
    ),
);

// Transactions Route
app.post(
    "/transactions",
    auth,
    upload.single("attachment"),
    asyncErrorWrapper(
        transactionsController.createTransaction.bind(transactionsController),
    ),
);
app.get(
    "/transactions/monthly-summary",
    auth,
    asyncErrorWrapper(
        transactionsController.getMonthlySummary.bind(transactionsController),
    ),
);
app.get(
    "/transactions/categories-summary",
    auth,
    asyncErrorWrapper(
        transactionsController.getCategoriesSummary.bind(
            transactionsController,
        ),
    ),
);
app.get(
    "/transactions/summary",
    auth,
    asyncErrorWrapper(
        transactionsController.getTransactionSummary.bind(
            transactionsController,
        ),
    ),
);
app.get("/transactions/summary2", asyncErrorWrapper(async (req, res) => {
   const filter = req.body;
   const transactions = await getTransactions(filter);
   res.json(transactions);
}))

app.use(errorMiddleware);

app.listen(config.api.port, () => {
    console.log(`Server is running on port ${config.api.port}`);
});
