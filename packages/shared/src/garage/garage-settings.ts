import { z } from 'zod';

/** Garage and pickup settings. The admin edits these from the settings screen. */
export const garageSettingsSchema = z.object({
  /** Price of one garage hour (SYP). */
  hourlyRate: z.number().int().nonnegative(),
  /** Minutes the customer has to pick the car up after the WhatsApp notice. */
  pickupGraceMinutes: z.number().int().min(0).max(240),
  /**
   * When the customer is late past the grace period:
   * true  = charge from the moment of the notice (minute 0),
   * false = charge only the time after the grace period.
   */
  chargeFromNotice: z.boolean(),
  /** Free minutes for a normal parking session (not a wash). */
  parkingFreeMinutes: z.number().int().min(0).max(240),
});

export type GarageSettings = z.infer<typeof garageSettingsSchema>;

export const DEFAULT_GARAGE_SETTINGS: GarageSettings = {
  hourlyRate: 10_000,
  pickupGraceMinutes: 15,
  chargeFromNotice: false,
  parkingFreeMinutes: 15,
};
