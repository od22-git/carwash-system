import { boolean, doublePrecision, pgTable, text } from 'drizzle-orm/pg-core';
import { syncColumns } from '../../database/columns';

export const workers = pgTable('workers', {
  ...syncColumns(),
  name: text('name').notNull(),
  phone: text('phone').notNull().default(''),
  payType: text('pay_type').notNull(),
  /** Amount per day/week (SYP) or commission percent, depending on pay_type. */
  rate: doublePrecision('rate').notNull(),
  active: boolean('active').notNull(),
});
