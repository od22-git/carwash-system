CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"units_per_carton" integer NOT NULL,
	"barcode" text DEFAULT '' NOT NULL,
	"retail_price" integer DEFAULT 0 NOT NULL,
	"wholesale_price" integer DEFAULT 0 NOT NULL,
	"min_qty" integer DEFAULT 0 NOT NULL,
	"active" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"receipt_no" text NOT NULL,
	"lines" jsonb NOT NULL,
	"total" integer NOT NULL,
	"status" text NOT NULL,
	"sold_at" timestamp with time zone NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"device_id" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"product_id" text NOT NULL,
	"type" text NOT NULL,
	"qty" integer NOT NULL,
	"value" integer NOT NULL,
	"counted" integer,
	"at" timestamp with time zone NOT NULL,
	"supplier" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "sales_sold_at_idx" ON "sales" USING btree ("sold_at");--> statement-breakpoint
CREATE INDEX "stock_movements_product_at_idx" ON "stock_movements" USING btree ("product_id","at");