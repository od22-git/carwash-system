import { formatSYP, type CustomerRecord, type DebtPaymentRecord } from '@carwash/shared';
import { useState } from 'react';
import { useSessionUser } from '../../../core/auth';
import { formatDate } from '../../../shared/lib/time-format';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Notice, Table } from '../../../shared/ui';
import { useCustomerDebt } from '../hooks/use-debts';
import { deleteDebtPayment } from '../lib/debt-actions';
import { DebtPaymentForm } from './DebtPaymentForm';
import { PrintDebtPaymentButton } from './DebtPaymentReceipt';

const KIND = { wash: 'غسيل', garage: 'كراج' };

/** The customer's account: receipts taken on credit, payments made, and what is still owed. */
export function DebtPanel({ customer }: { customer: CustomerRecord }) {
  const debt = useCustomerDebt(customer.id);
  const user = useSessionUser();
  const action = useAction();
  const [paid, setPaid] = useState<DebtPaymentRecord | null>(null);
  if (!debt) return null;
  if (debt.owed.length === 0 && debt.payments.length === 0) {
    return <p className="text-sm text-muted">لا يوجد حساب آجل لهذا العميل.</p>;
  }

  return (
    <section aria-label="الحساب الآجل" className="flex flex-col gap-4">
      <h3 className="flex flex-wrap items-baseline gap-3 font-semibold">
        الحساب الآجل
        <span className={debt.balance > 0 ? 'text-status-grace' : 'text-status-done'}>
          {debt.balance > 0 ? `المستحق ${formatSYP(debt.balance)}` : 'لا يوجد مبلغ مستحق'}
        </span>
      </h3>
      <Table headers={['الإيصال', 'النوع', 'اللوحة', 'التاريخ', 'المبلغ']} minWidth="30rem">
        {debt.owed.map((r) => (
          <tr key={r.id} className="border-b border-line last:border-0">
            <td className="px-3 py-2">{r.receiptNo}</td>
            <td className="px-3 py-2">{KIND[r.kind]}</td>
            <td className="px-3 py-2" dir="ltr">
              <span className="block text-right">{r.plate}</span>
            </td>
            <td className="px-3 py-2 tabular-nums">{formatDate(r.at)}</td>
            <td className="px-3 py-2 tabular-nums">{formatSYP(r.amount)}</td>
          </tr>
        ))}
      </Table>
      {debt.payments.length > 0 && (
        <Table headers={['دفعة', 'التاريخ', 'المبلغ', 'ملاحظة', '']} minWidth="30rem">
          {debt.payments.map((p) => (
            <tr key={p.id} className="border-b border-line last:border-0">
              <td className="px-3 py-2">{p.receiptNo}</td>
              <td className="px-3 py-2 tabular-nums">{formatDate(p.at)}</td>
              <td className="px-3 py-2 tabular-nums">{formatSYP(p.amount)}</td>
              <td className="px-3 py-2 text-muted">{p.note}</td>
              <td className="flex gap-1 px-3 py-1">
                <PrintDebtPaymentButton payment={p} />
                {user?.role === 'admin' && (
                  <Button
                    variant="quiet"
                    disabled={action.busy}
                    onClick={() => void action.run(() => deleteDebtPayment(p, user))}
                  >
                    حذف
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
      {paid && (
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="success">سُجّلت الدفعة، الإيصال {paid.receiptNo}.</Notice>
          <PrintDebtPaymentButton payment={paid} />
        </div>
      )}
      {debt.balance > 0 && (
        <DebtPaymentForm
          key={debt.balance}
          customer={customer}
          balance={debt.balance}
          onPaid={setPaid}
        />
      )}
    </section>
  );
}
