CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"month" text NOT NULL,
	"line" text NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"category" text NOT NULL,
	"amount" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "expenses_at_idx" ON "expenses" USING btree ("at");