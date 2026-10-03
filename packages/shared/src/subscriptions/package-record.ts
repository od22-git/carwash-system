import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

/** What a package gives the car, copied onto every subscription sold. */
export const packageTermsSchema = z.object({
  /** Free washes during the package. */
  freeWashes: z.number().int().min(0).max(99),
  /** The services a free wash covers; other services on the same visit are paid. */
  washServiceIds: z.array(z.string().min(1)).max(30).default([]),
  /** The car parks in the garage free while the package lasts. */
  includesParking: z.boolean(),
});
export type PackageTerms = z.infer<typeof packageTermsSchema>;

/**
 * A package the admin offers (e.g. "شهري": 30 days, 4 free washes, garage included).
 * The owner has not fixed his packages yet, so everything here is editable.
 */
export const packageRecordSchema = syncRecordBase
  .extend({
    name: z.string().trim().min(2).max(60),
    price: z.number().int().nonnegative(),
    durationDays: z.number().int().min(1).max(366),
    active: z.boolean(),
    sortOrder: z.number().int(),
  })
  .merge(packageTermsSchema)
  .refine((p) => p.includesParking || p.freeWashes > 0, {
    message: 'A package gives free washes, the garage, or both',
    path: ['freeWashes'],
  })
  .refine((p) => p.freeWashes === 0 || p.washServiceIds.length > 0, {
    message: 'Pick the services a free wash covers',
    path: ['washServiceIds'],
  });
export type PackageRecord = z.infer<typeof packageRecordSchema>;
