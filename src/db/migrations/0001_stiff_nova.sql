ALTER TABLE "transactions" ALTER COLUMN "transaction_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "transaction_time" SET DEFAULT now();