CREATE TABLE "parking_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"duration_hours" integer NOT NULL,
	"price" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parking_sessions" (
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
	"plan_name" text NOT NULL,
	"plan" jsonb NOT NULL,
	"covered_until" timestamp with time zone,
	"status" text NOT NULL,
	"entered_at" timestamp with time zone NOT NULL,
	"left_at" timestamp with time zone,
	"fee" integer DEFAULT 0 NOT NULL,
	"billed_hours" integer DEFAULT 0 NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"duration_days" integer NOT NULL,
	"free_washes" integer NOT NULL,
	"wash_service_ids" jsonb NOT NULL,
	"includes_parking" boolean NOT NULL,
	"active" boolean NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
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
	"package_id" text NOT NULL,
	"package_name" text NOT NULL,
	"price" integer NOT NULL,
	"free_washes" integer NOT NULL,
	"wash_service_ids" jsonb NOT NULL,
	"includes_parking" boolean NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "subscription_id" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "package_discount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "covered_until" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "parking_sessions_entered_at_idx" ON "parking_sessions" USING btree ("entered_at");--> statement-breakpoint
CREATE INDEX "subscriptions_vehicle_idx" ON "subscriptions" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "tickets_subscription_idx" ON "tickets" USING btree ("subscription_id");