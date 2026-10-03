import {
  formatSYP,
  WORKER_PAYMENT_LABELS,
  type SessionUser,
  type WorkerPaymentKind,
  type WorkerPaymentRecord,
  type WorkerPublic,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { deleteRecord, saveRecord } from '../../../core/sync';
import { UserError } from '../../../shared/lib/user-error';

export interface WorkerPaymentInput {
  workerId: string;
  kind: WorkerPaymentKind;
  amount: number;
  at: number;
  note: string;
}

/** Money given to a worker (an advance, or wages). */
export async function recordWorkerPayment(input: WorkerPaymentInput) {
  if (!input.workerId) throw new UserError('اختر العامل.');
  if (!(input.amount > 0)) throw new UserError('اكتب المبلغ.');
  const row = { ...input, note: input.note.trim() };
  return (await saveRecord('workerPayments', row)) as WorkerPaymentRecord;
}

/** Admin only: removes a wrong entry, logged. */
export async function deleteWorkerPayment(
  payment: WorkerPaymentRecord,
  worker: WorkerPublic | undefined,
  user: SessionUser,
) {
  await deleteRecord('workerPayments', payment.id);
  await logAudit({
    action: 'worker-payment.delete',
    user,
    targetId: payment.id,
    summary: `${WORKER_PAYMENT_LABELS[payment.kind]} ${worker?.name ?? ''} (${formatSYP(payment.amount)})`,
    reason: '',
  });
}
