import { formatSYP, type DebtPaymentRecord, type SessionUser } from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { nextReceiptNo } from '../../../core/db';
import { deleteRecord, saveRecord } from '../../../core/sync';
import { UserError } from '../../../shared/lib/user-error';

/** The customer pays (part of) what they owe; a receipt number is given. */
export async function recordDebtPayment(
  customer: { id: string; name: string },
  amount: number,
  note: string,
): Promise<DebtPaymentRecord> {
  if (!(amount > 0)) throw new UserError('اكتب المبلغ المدفوع.');
  const row = {
    receiptNo: await nextReceiptNo(),
    customerId: customer.id,
    customerName: customer.name,
    amount,
    at: Date.now(),
    note: note.trim(),
  };
  return (await saveRecord('debtPayments', row)) as DebtPaymentRecord;
}

/** Admin only: removes a wrong payment, logged. */
export async function deleteDebtPayment(payment: DebtPaymentRecord, user: SessionUser) {
  await deleteRecord('debtPayments', payment.id);
  await logAudit({
    action: 'debt-payment.delete',
    user,
    targetId: payment.id,
    summary: `${payment.receiptNo} ${payment.customerName} (${formatSYP(payment.amount)})`,
    reason: '',
  });
}
