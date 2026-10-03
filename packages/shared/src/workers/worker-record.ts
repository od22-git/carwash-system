import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import { PAY_TYPES } from './pay-type';

export const workerRecordSchema = syncRecordBase
  .extend({
    name: z.string().trim().min(2).max(60),
    phone: z.string().trim().max(20).default(''),
    payType: z.enum(PAY_TYPES),
    /** Amount per day / week (SYP), or commission percent. */
    rate: z.number().nonnegative(),
    active: z.boolean(),
  })
  .refine((w) => w.payType !== 'commission' || w.rate <= 100, {
    message: 'Commission percent must be 0-100',
    path: ['rate'],
  });
export type WorkerRecord = z.infer<typeof workerRecordSchema>;

/** What the cashier's laptop receives: who the workers are, not what they earn. */
export type WorkerPublic = Omit<WorkerRecord, 'payType' | 'rate'> &
  Partial<Pick<WorkerRecord, 'payType' | 'rate'>>;

export const PAY_FIELDS = ['payType', 'rate'] as const;
