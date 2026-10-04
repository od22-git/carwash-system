import { z } from 'zod';

/** A moment that may not have happened yet (epoch ms, or null). */
export const nullableTime = () => z.number().int().nullable().default(null);

/**
 * Fields every printed receipt about a car has. Customer name and plate are copied in,
 * so receipts and history stay correct even if the customer or car is edited later.
 */
export const carReceiptFields = {
  receiptNo: z.string().min(3).max(20),
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  customerName: z.string().min(1),
  plate: z.string().min(1),
};

/** Why the admin cancelled (optional). */
export const cancelFields = {
  cancelledAt: nullableTime(),
  cancelReason: z.string().max(200).default(''),
};

/** Paid later: the amount is added to the customer's debt instead of taken now (آجل). */
export const paidLaterField = {
  paidLater: z.boolean().default(false),
};
