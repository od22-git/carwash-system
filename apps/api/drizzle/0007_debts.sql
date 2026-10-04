CREATE TABLE "debt_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"receipt_no" text NOT NULL,
	"customer_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"amount" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_sessions" ADD COLUMN "paid_later" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "paid_later" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "debt_payments_customer_idx" ON "debt_payments" USING btree ("customer_id");