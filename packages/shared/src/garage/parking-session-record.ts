import { z } from 'zod';
import {
  cancelFields,
  carReceiptFields,
  nullableTime,
  paidLaterField,
} from '../contracts/record-fields';
import { syncRecordBase } from '../contracts/sync';
import { parkingPlanSchema } from './parking-plan';
import { PARKING_STATUSES } from './parking-status';

/** A car parked in the garage (not a wash): when it came, its plan, and what it paid. */
export const parkingSessionRecordSchema = syncRecordBase.extend({
  ...carReceiptFields,
  planName: z.string().min(1).max(40),
  /** The plan as it was when the car entered. */
  plan: parkingPlanSchema,
  /** The car's package covers the garage until then. */
  coveredUntil: nullableTime(),
  status: z.enum(PARKING_STATUSES),
  enteredAt: z.number().int(),
  leftAt: nullableTime(),
  fee: z.number().int().nonnegative().default(0),
  /** Hours charged at the hourly rate (for a fixed plan: the hours past the plan). */
  billedHours: z.number().int().nonnegative().default(0),
  ...paidLaterField,
  ...cancelFields,
  notes: z.string().max(300).default(''),
});
export type ParkingSessionRecord = z.infer<typeof parkingSessionRecordSchema>;
