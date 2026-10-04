CREATE TABLE "cash_closes" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"day" text NOT NULL,
	"expected" integer NOT NULL,
	"float" integer NOT NULL,
	"paid_out" integer NOT NULL,
	"counted" integer NOT NULL,
	"closed_by" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
