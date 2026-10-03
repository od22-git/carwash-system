import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import type { ParkingPlan } from './parking-plan';

/**
 * A fixed-period plan the admin offers, e.g. "يوم" = 24 hours for 150,000.
 * Paying by the hour is always available and uses the hourly rate from the settings.
 */
export const parkingPlanRecordSchema = syncRecordBase.extend({
  name: z.string().trim().min(2).max(40),
  durationHours: z
    .number()
    .int()
    .min(1)
    .max(24 * 31),
  price: z.number().int().positive(),
  sortOrder: z.number().int(),
  active: z.boolean(),
});
export type ParkingPlanRecord = z.infer<typeof parkingPlanRecordSchema>;

/** Starting points for the admin's plans (the price is theirs to set). */
export const PLAN_PRESETS = [
  { name: 'يوم', durationHours: 24 },
  { name: 'يومين', durationHours: 48 },
];

export const toParkingPlan = (record: ParkingPlanRecord): ParkingPlan => ({
  kind: 'fixed',
  durationHours: record.durationHours,
  price: record.price,
});
