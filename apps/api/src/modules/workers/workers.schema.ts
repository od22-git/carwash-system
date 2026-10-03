import { boolean, doublePrecision, index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

export const workers = pgTable('workers', {
  ...syncColumns(),
  name: text('name').notNull(),
  phone: text('phone').notNull().default(''),
  payType: text('pay_type').notNull(),
  /** Amount per day/week (SYP) or commission percent, depending on pay_type. */
  rate: doublePrecision('rate').notNull(),
  active: boolean('active').notNull(),
});

/** Advances and wage payments: money given to workers. Admin only. */
export const workerPayments = pgTable(
  'worker_payments',
  {
    ...syncColumns(),
    workerId: text('worker_id').notNull(),
    kind: text('kind').notNull(),
    amount: integer('amount').notNull(),
    at: epochMs('at').notNull(),
    note: text('note').notNull().default(''),
  },
  (t) => [index('worker_payments_at_idx').on(t.at)],
);
