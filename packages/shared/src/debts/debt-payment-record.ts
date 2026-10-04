import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

/** Money a customer paid towards what they owe (receipts they took "على الحساب"). */
export const debtPaymentRecordSchema = syncRecordBase.extend({
  receiptNo: z.string().min(3).max(20),
  customerId: z.string().min(1),
  /** Copied in, so the receipt stays right if the customer is renamed. */
  customerName: z.string().min(1),
  amount: z.number().int().positive(),
  at: z.number().int(),
  note: z.string().trim().max(200).default(''),
});
export type DebtPaymentRecord = z.infer<typeof debtPaymentRecordSchema>;
