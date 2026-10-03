import { formatSYP, WORKER_PAYMENT_LABELS, type WorkerPaymentRecord } from '@carwash/shared';
import { useSessionUser } from '../../../../core/auth';
import { formatDate } from '../../../../shared/lib/time-format';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Table } from '../../../../shared/ui';
import { useWorkers } from '../../hooks/use-workers';
import { deleteWorkerPayment } from '../../lib/payment-actions';

/** The period's advances and wage payments. A wrong one can be deleted (logged). */
export function PaymentsList({ payments }: { payments: WorkerPaymentRecord[] }) {
  const { workers } = useWorkers();
  const user = useSessionUser();
  const action = useAction();
  if (payments.length === 0) return <p className="text-muted">لا توجد دفعات في هذه الفترة.</p>;

  return (
    <Table headers={['التاريخ', 'العامل', 'النوع', 'المبلغ', 'ملاحظة', '']} minWidth="40rem">
      {payments.map((p) => {
        const worker = workers.find((w) => w.id === p.workerId);
        return (
          <tr key={p.id} className="border-b border-line last:border-0">
            <td className="px-3 py-2 tabular-nums">{formatDate(p.at)}</td>
            <td className="px-3 py-2 font-semibold">{worker?.name ?? '—'}</td>
            <td className="px-3 py-2">{WORKER_PAYMENT_LABELS[p.kind]}</td>
            <td className="px-3 py-2 tabular-nums">{formatSYP(p.amount)}</td>
            <td className="px-3 py-2 text-muted">{p.note}</td>
            <td className="px-3 py-1">
              <Button
                variant="quiet"
                disabled={action.busy || !user}
                onClick={() => void action.run(() => deleteWorkerPayment(p, worker, user!))}
              >
                حذف
              </Button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
