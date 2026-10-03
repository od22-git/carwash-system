CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"action" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"target_id" text NOT NULL,
	"summary" text NOT NULL,
	"reason" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"receipt_no" text NOT NULL,
	"customer_id" text NOT NULL,
	"vehicle_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"plate" text NOT NULL,
	"size" text NOT NULL,
	"worker_id" text NOT NULL,
	"requested_worker" boolean DEFAULT false NOT NULL,
	"status" text NOT NULL,
	"lines" jsonb NOT NULL,
	"wash_total" integer NOT NULL,
	"garage_fee" integer DEFAULT 0 NOT NULL,
	"garage_hours" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"arrived_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"notified_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tickets_arrived_at_idx" ON "tickets" USING btree ("arrived_at");--> statement-breakpoint
CREATE INDEX "tickets_worker_idx" ON "tickets" USING btree ("worker_id");