import { z } from 'zod';
import { CAR_SIZES } from '../catalog/car-size';
import { cancelFields, carReceiptFields, nullableTime } from '../contracts/record-fields';
import { syncRecordBase } from '../contracts/sync';
import { TICKET_STATUSES } from './ticket-status';

/** A service as it was priced on this ticket (later price changes do not touch old tickets). */
export const ticketLineSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
});
export type TicketLine = z.infer<typeof ticketLineSchema>;

/** One car's visit to the wash: what was done, by whom, when, and what it cost. */
export const ticketRecordSchema = syncRecordBase.extend({
  ...carReceiptFields,
  size: z.enum(CAR_SIZES),
  workerId: z.string().min(1),
  /** The customer asked for this worker, so the car waits until they are free. */
  requestedWorker: z.boolean().default(false),
  status: z.enum(TICKET_STATUSES),
  lines: z.array(ticketLineSchema).min(1),
  /** The package a free wash was taken from, if any. */
  subscriptionId: z.string().nullable().default(null),
  /** Taken off the wash by that free wash. */
  packageDiscount: z.number().int().nonnegative().default(0),
  /** What the wash costs after the discount. */
  washTotal: z.number().int().nonnegative(),
  /** The car's package covers the garage until then (no late-pickup fee before it). */
  coveredUntil: nullableTime(),
  garageFee: z.number().int().nonnegative().default(0),
  garageHours: z.number().int().nonnegative().default(0),
  total: z.number().int().nonnegative(),
  arrivedAt: z.number().int(),
  startedAt: nullableTime(),
  notifiedAt: nullableTime(),
  deliveredAt: nullableTime(),
  ...cancelFields,
  notes: z.string().max(300).default(''),
});
export type TicketRecord = z.infer<typeof ticketRecordSchema>;
