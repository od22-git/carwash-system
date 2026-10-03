import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

/** An advance (سلفة) is taken before the pay is due; a wage payment settles it. */
export const WORKER_PAYMENT_KINDS = ['advance', 'wage'] as const;
export type WorkerPaymentKind = (typeof WORKER_PAYMENT_KINDS)[number];

export const WORKER_PAYMENT_LABELS: Record<WorkerPaymentKind, string> = {
  advance: 'سلفة',
  wage: 'دفعة أجر',
};

/** Money given to a worker. Both kinds are taken off what the worker is owed. */
export const workerPaymentRecordSchema = syncRecordBase.extend({
  workerId: z.string().min(1),
  kind: z.enum(WORKER_PAYMENT_KINDS),
  amount: z.number().int().positive(),
  at: z.number().int(),
  note: z.string().trim().max(200).default(''),
});
export type WorkerPaymentRecord = z.infer<typeof workerPaymentRecordSchema>;
