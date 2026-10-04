import { formatSYP, type CashCloseRecord, type SessionUser } from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { db } from '../../../core/db';
import { deleteRecord, saveRecord } from '../../../core/sync';
import { toDateInput } from '../../../shared/lib/date-input';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { UserError } from '../../../shared/lib/user-error';

export interface CloseInput {
  day: string;
  /** Cash in from the day's receipts, as shown on the screen. */
  expected: number;
  float: string;
  paidOut: string;
  counted: string;
  note: string;
}

/** Empty means 0; anything else must be a whole number. */
function amount(text: string, required: string | null): number {
  if (text.trim() === '') {
    if (required) throw new UserError(required);
    return 0;
  }
  const value = parseWholeNumber(text);
  if (Number.isNaN(value)) throw new UserError('اكتب المبالغ بالأرقام.');
  return value;
}

/** Closes the day's drawer once; the admin can reopen it. */
export async function closeCash(input: CloseInput, user: SessionUser): Promise<CashCloseRecord> {
  if (input.day > toDateInput(Date.now())) throw new UserError('لا يمكن إغلاق يوم لم يأتِ بعد.');
  const existing = await db.cashCloses.get(input.day);
  if (existing && !existing.deletedAt) throw new UserError('أُغلق صندوق هذا اليوم من قبل.');
  const row = {
    id: input.day,
    day: input.day,
    expected: input.expected,
    float: amount(input.float, null),
    paidOut: amount(input.paidOut, null),
    counted: amount(input.counted, 'اكتب المبلغ الموجود في الصندوق.'),
    closedBy: user.name,
    at: Date.now(),
    note: input.note.trim(),
    deletedAt: null,
  };
  return (await saveRecord('cashCloses', row)) as CashCloseRecord;
}

/** Admin only: opens a closed day again (e.g. a receipt was forgotten), logged. */
export async function reopenCash(close: CashCloseRecord, user: SessionUser) {
  await deleteRecord('cashCloses', close.id);
  await logAudit({
    action: 'cash-close.reopen',
    user,
    targetId: close.id,
    summary: `${close.day} (${formatSYP(close.counted)})`,
    reason: '',
  });
}
