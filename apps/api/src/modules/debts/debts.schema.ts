import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

/** Money customers paid towards receipts they took on credit (آجل). */
export const debtPayments = pgTable(
  'debt_payments',
  {
    ...syncColumns(),
    receiptNo: text('receipt_no').notNull(),
    customerId: text('customer_id').notNull(),
    customerName: text('customer_name').notNull(),
    amount: integer('amount').notNull(),
    at: epochMs('at').notNull(),
    note: text('note').notNull().default(''),
  },
  (t) => [index('debt_payments_customer_idx').on(t.customerId)],
);
