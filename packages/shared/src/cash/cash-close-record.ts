import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const amount = z.number().int().nonnegative();

/**
 * The end-of-day count of the cash drawer. Its id is the day ("2026-10-04"), so the shop
 * has one close per day even when both laptops close it.
 */
export const cashCloseRecordSchema = syncRecordBase
  .extend({
    day: z.string().regex(DAY),
    /** Cash the receipts say came in that day (copied in at closing time). */
    expected: amount,
    /** Change that was in the drawer when the day started (الفكة). */
    float: amount,
    /** Cash taken out of the drawer during the day (paid a bill, a wage…). */
    paidOut: amount,
    /** Everything counted in the drawer, float included. */
    counted: amount,
    closedBy: z.string().min(1),
    at: z.number().int(),
    note: z.string().trim().max(300).default(''),
  })
  .refine((c) => c.id === c.day, { message: 'Cash close id must be its day', path: ['id'] });
export type CashCloseRecord = z.infer<typeof cashCloseRecordSchema>;
