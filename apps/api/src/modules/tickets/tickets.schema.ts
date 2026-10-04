import { boolean, index, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import type { TicketLine } from '@carwash/shared';
import { epochMs, syncColumns } from '../../database/columns';

/** One car's visit. Lines are a snapshot of the services and prices at the time. */
export const tickets = pgTable(
  'tickets',
  {
    ...syncColumns(),
    receiptNo: text('receipt_no').notNull(),
    customerId: text('customer_id').notNull(),
    vehicleId: text('vehicle_id').notNull(),
    customerName: text('customer_name').notNull(),
    plate: text('plate').notNull(),
    size: text('size').notNull(),
    workerId: text('worker_id').notNull(),
    requestedWorker: boolean('requested_worker').notNull().default(false),
    status: text('status').notNull(),
    lines: jsonb('lines').$type<TicketLine[]>().notNull(),
    subscriptionId: text('subscription_id'),
    packageDiscount: integer('package_discount').notNull().default(0),
    washTotal: integer('wash_total').notNull(),
    coveredUntil: epochMs('covered_until'),
    garageFee: integer('garage_fee').notNull().default(0),
    garageHours: integer('garage_hours').notNull().default(0),
    total: integer('total').notNull(),
    arrivedAt: epochMs('arrived_at').notNull(),
    startedAt: epochMs('started_at'),
    notifiedAt: epochMs('notified_at'),
    deliveredAt: epochMs('delivered_at'),
    paidLater: boolean('paid_later').notNull().default(false),
    cancelledAt: epochMs('cancelled_at'),
    cancelReason: text('cancel_reason').notNull().default(''),
    notes: text('notes').notNull().default(''),
  },
  // Reports filter by day and by worker.
  (t) => [
    index('tickets_arrived_at_idx').on(t.arrivedAt),
    index('tickets_worker_idx').on(t.workerId),
    index('tickets_subscription_idx').on(t.subscriptionId),
  ],
);
