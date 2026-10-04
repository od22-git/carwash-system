import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

/** Running costs entered by the admin (rent, electricity, internet, ...). */
export const expenses = pgTable(
  'expenses',
  {
    ...syncColumns(),
    category: text('category').notNull(),
    amount: integer('amount').notNull(),
    at: epochMs('at').notNull(),
    note: text('note').notNull().default(''),
  },
  (t) => [index('expenses_at_idx').on(t.at)],
);

/** Planned spending per month and line; id = "<month>:<line>". */
export const budgets = pgTable('budgets', {
  ...syncColumns(),
  month: text('month').notNull(),
  line: text('line').notNull(),
  amount: integer('amount').notNull(),
});
