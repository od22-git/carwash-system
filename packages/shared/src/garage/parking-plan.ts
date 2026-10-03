import { z } from 'zod';

/**
 * How a parking session is charged, copied onto the session when the car enters:
 * by the hour, or a fixed period (a day, two days, ...) with its price.
 */
export const parkingPlanSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('hourly') }),
  z.object({
    kind: z.literal('fixed'),
    durationHours: z.number().int().positive(),
    price: z.number().int().nonnegative(),
  }),
]);
export type ParkingPlan = z.infer<typeof parkingPlanSchema>;

export const HOURLY_PLAN_NAME = 'بالساعة';
