import type { SaleLine } from '@carwash/shared';
import { boolean, index, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

/** Products of the three stocks: wash materials, car products, buffet. */
export const products = pgTable('products', {
  ...syncColumns(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  unit: text('unit').notNull(),
  unitsPerCarton: integer('units_per_carton').notNull(),
  barcode: text('barcode').notNull().default(''),
  retailPrice: integer('retail_price').notNull().default(0),
  wholesalePrice: integer('wholesale_price').notNull().default(0),
  minQty: integer('min_qty').notNull().default(0),
  active: boolean('active').notNull(),
});

/** Purchases, counts and damage: the admin's stock ledger (sales live on the receipts). */
export const stockMovements = pgTable(
  'stock_movements',
  {
    ...syncColumns(),
    productId: text('product_id').notNull(),
    type: text('type').notNull(),
    qty: integer('qty').notNull(),
    value: integer('value').notNull(),
    counted: integer('counted'),
    at: epochMs('at').notNull(),
    supplier: text('supplier').notNull().default(''),
    note: text('note').notNull().default(''),
  },
  (t) => [index('stock_movements_product_at_idx').on(t.productId, t.at)],
);

/** Counter sales (car products and buffet). */
export const sales = pgTable(
  'sales',
  {
    ...syncColumns(),
    receiptNo: text('receipt_no').notNull(),
    lines: jsonb('lines').$type<SaleLine[]>().notNull(),
    total: integer('total').notNull(),
    status: text('status').notNull(),
    soldAt: epochMs('sold_at').notNull(),
    notes: text('notes').notNull().default(''),
    cancelledAt: epochMs('cancelled_at'),
    cancelReason: text('cancel_reason').notNull().default(''),
  },
  (t) => [index('sales_sold_at_idx').on(t.soldAt)],
);
