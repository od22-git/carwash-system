import { pgTable, text } from 'drizzle-orm/pg-core';
import { syncColumns } from '../../database/columns';

export const customers = pgTable('customers', {
  ...syncColumns(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  job: text('job').notNull().default(''),
  phone: text('phone').notNull(),
  notes: text('notes').notNull().default(''),
});

/**
 * No foreign key to customers on purpose: laptops sync independently, and a car may
 * arrive before its customer. The apps keep the link consistent.
 */
export const vehicles = pgTable('vehicles', {
  ...syncColumns(),
  customerId: text('customer_id').notNull(),
  plate: text('plate').notNull(),
  color: text('color').notNull().default(''),
  size: text('size').notNull(),
});
