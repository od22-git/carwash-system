import type { ParkingPlan } from '@carwash/shared';
import { boolean, index, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs, syncColumns } from '../../database/columns';

/** Fixed-period plans the admin offers (a day, two days, ...). */
export const parkingPlans = pgTable('parking_plans', {
  ...syncColumns(),
  name: text('name').notNull(),
  durationHours: integer('duration_hours').notNull(),
  price: integer('price').notNull(),
  sortOrder: integer('sort_order').notNull(),
  active: boolean('active').notNull(),
});

/** A car parked in the garage. The plan is a snapshot taken when the car entered. */
export const parkingSessions = pgTable(
  'parking_sessions',
  {
    ...syncColumns(),
    receiptNo: text('receipt_no').notNull(),
    customerId: text('customer_id').notNull(),
    vehicleId: text('vehicle_id').notNull(),
    customerName: text('customer_name').notNull(),
    plate: text('plate').notNull(),
    planName: text('plan_name').notNull(),
    plan: jsonb('plan').$type<ParkingPlan>().notNull(),
    coveredUntil: epochMs('covered_until'),
    status: text('status').notNull(),
    enteredAt: epochMs('entered_at').notNull(),
    leftAt: epochMs('left_at'),
    fee: integer('fee').notNull().default(0),
    billedHours: integer('billed_hours').notNull().default(0),
    paidLater: boolean('paid_later').notNull().default(false),
    cancelledAt: epochMs('cancelled_at'),
    cancelReason: text('cancel_reason').notNull().default(''),
    notes: text('notes').notNull().default(''),
  },
  (t) => [index('parking_sessions_entered_at_idx').on(t.enteredAt)],
);
