import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

/** The end-of-day drawer count; the id is the day, so there is one per day. */
export const cashCloses = pgTable('cash_closes', {
  ...syncColumns(),
  day: text('day').notNull(),
  expected: integer('expected').notNull(),
  float: integer('float').notNull(),
  paidOut: integer('paid_out').notNull(),
  counted: integer('counted').notNull(),
  closedBy: text('closed_by').notNull(),
  at: epochMs('at').notNull(),
  note: text('note').notNull().default(''),
});
