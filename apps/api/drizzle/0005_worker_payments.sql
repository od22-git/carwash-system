CREATE TABLE "worker_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"worker_id" text NOT NULL,
	"kind" text NOT NULL,
	"amount" integer NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "worker_payments_at_idx" ON "worker_payments" USING btree ("at");