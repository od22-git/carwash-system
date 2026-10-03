CREATE TABLE "service_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"service_id" text NOT NULL,
	"size" text NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"job" text DEFAULT '' NOT NULL,
	"phone" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"customer_id" text NOT NULL,
	"plate" text NOT NULL,
	"color" text DEFAULT '' NOT NULL,
	"size" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"pay_type" text NOT NULL,
	"rate" double precision NOT NULL,
	"active" boolean NOT NULL
);
