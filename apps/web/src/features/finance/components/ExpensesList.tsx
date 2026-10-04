import { EXPENSE_CATEGORY_LABELS, formatSYP, type ExpenseRecord } from '@carwash/shared';
import { useSessionUser } from '../../../core/auth';
import { formatDate } from '../../../shared/lib/time-format';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Table } from '../../../shared/ui';
import { deleteExpense } from '../lib/finance-actions';

/** The month's running costs. A wrong one can be deleted (logged). */
export function ExpensesList({ expenses }: { expenses: ExpenseRecord[] }) {
  const user = useSessionUser();
  const action = useAction();
  if (expenses.length === 0) return <p className="text-muted">لا توجد مصاريف أخرى هذا الشهر.</p>;

  return (
    <Table headers={['التاريخ', 'البند', 'المبلغ', 'ملاحظة', '']} minWidth="32rem">
      {expenses.map((e) => (
        <tr key={e.id} className="border-b border-line last:border-0">
          <td className="px-3 py-2 tabular-nums">{formatDate(e.at)}</td>
          <td className="px-3 py-2 font-semibold">{EXPENSE_CATEGORY_LABELS[e.category]}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(e.amount)}</td>
          <td className="px-3 py-2 text-muted">{e.note}</td>
          <td className="px-3 py-1">
            <Button
              variant="quiet"
              disabled={action.busy || !user}
              onClick={() => void action.run(() => deleteExpense(e, user!))}
            >
              حذف
            </Button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
