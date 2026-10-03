import { boolean, index, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

const packageTerms = () => ({
  freeWashes: integer('free_washes').notNull(),
  washServiceIds: jsonb('wash_service_ids').$type<string[]>().notNull(),
  includesParking: boolean('includes_parking').notNull(),
});

/** Packages the admin offers: days, price, free washes, garage included or not. */
export const packages = pgTable('packages', {
  ...syncColumns(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  durationDays: integer('duration_days').notNull(),
  ...packageTerms(),
  active: boolean('active').notNull(),
  sortOrder: integer('sort_order').notNull(),
});

/** A package sold for one car, with the package terms copied in. */
export const subscriptions = pgTable(
  'subscriptions',
  {
    ...syncColumns(),
    receiptNo: text('receipt_no').notNull(),
    customerId: text('customer_id').notNull(),
    vehicleId: text('vehicle_id').notNull(),
    customerName: text('customer_name').notNull(),
    plate: text('plate').notNull(),
    packageId: text('package_id').notNull(),
    packageName: text('package_name').notNull(),
    price: integer('price').notNull(),
    ...packageTerms(),
    startsAt: epochMs('starts_at').notNull(),
    endsAt: epochMs('ends_at').notNull(),
    status: text('status').notNull(),
    cancelledAt: epochMs('cancelled_at'),
    cancelReason: text('cancel_reason').notNull().default(''),
  },
  (t) => [index('subscriptions_vehicle_idx').on(t.vehicleId)],
);
