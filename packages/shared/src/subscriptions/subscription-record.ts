import { z } from 'zod';
import { cancelFields, carReceiptFields } from '../contracts/record-fields';
import { syncRecordBase } from '../contracts/sync';
import { packageTermsSchema } from './package-record';

export const SUBSCRIPTION_STATUSES = ['active', 'cancelled'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/**
 * A package sold for one car. The terms are copied in, so editing the package later
 * does not change what this customer already paid for. Free washes used are counted
 * from the tickets that point here, so two laptops never overwrite each other.
 */
export const subscriptionRecordSchema = syncRecordBase
  .extend({
    ...carReceiptFields,
    packageId: z.string().min(1),
    packageName: z.string().min(1),
    price: z.number().int().nonnegative(),
    startsAt: z.number().int(),
    endsAt: z.number().int(),
    status: z.enum(SUBSCRIPTION_STATUSES),
    ...cancelFields,
  })
  .merge(packageTermsSchema)
  .refine((s) => s.endsAt > s.startsAt, { message: 'Ends before it starts', path: ['endsAt'] });
export type SubscriptionRecord = z.infer<typeof subscriptionRecordSchema>;
