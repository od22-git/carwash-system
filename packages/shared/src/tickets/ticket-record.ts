import { z } from 'zod';
import { CAR_SIZES } from '../catalog/car-size';
import { syncRecordBase } from '../contracts/sync';
import { TICKET_STATUSES } from './ticket-status';

/** A service as it was priced on this ticket (later price changes do not touch old tickets). */
export const ticketLineSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
});
export type TicketLine = z.infer<typeof ticketLineSchema>;

const time = z.number().int().nullable().default(null);

/**
 * One car's visit: what was done, by whom, when, and what it cost.
 * Plate, size and customer name are copied in, so receipts and history stay correct
 * even if the customer or car is edited later.
 */
export const ticketRecordSchema = syncRecordBase.extend({
  receiptNo: z.string().min(3).max(20),
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  customerName: z.string().min(1),
  plate: z.string().min(1),
  size: z.enum(CAR_SIZES),
  workerId: z.string().min(1),
  /** The customer asked for this worker, so the car waits until they are free. */
  requestedWorker: z.boolean().default(false),
  status: z.enum(TICKET_STATUSES),
  lines: z.array(ticketLineSchema).min(1),
  washTotal: z.number().int().nonnegative(),
  garageFee: z.number().int().nonnegative().default(0),
  garageHours: z.number().int().nonnegative().default(0),
  total: z.number().int().nonnegative(),
  arrivedAt: z.number().int(),
  startedAt: time,
  notifiedAt: time,
  deliveredAt: time,
  cancelledAt: time,
  cancelReason: z.string().max(200).default(''),
  notes: z.string().max(300).default(''),
});
export type TicketRecord = z.infer<typeof ticketRecordSchema>;
