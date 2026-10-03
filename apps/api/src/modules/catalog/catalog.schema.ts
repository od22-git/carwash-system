import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { syncColumns } from '../../database/columns';

export const services = pgTable('services', {
  ...syncColumns(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull(),
  active: boolean('active').notNull(),
});

/** One row per (service, car size); id is "<serviceId>:<size>". */
export const servicePrices = pgTable('service_prices', {
  ...syncColumns(),
  serviceId: text('service_id').notNull(),
  size: text('size').notNull(),
  price: integer('price').notNull(),
});
