import { formatSYP } from '@carwash/shared';
import { Table } from '../../../shared/ui';
import { useDebtors } from '../hooks/use-debts';

/** Who owes the shop money (receipts taken on credit, less payments), largest first. */
export function DebtorsTable() {
  const debtors = useDebtors();
  if (!debtors) return null;
  if (debtors.length === 0) return <p className="text-muted">لا توجد ديون على العملاء.</p>;
  const total = debtors.reduce((sum, d) => sum + d.balance, 0);

  return (
    <Table headers={['العميل', 'على الحساب', 'المدفوع', 'المستحق']} minWidth="30rem">
      {debtors.map((d) => (
        <tr key={d.customerId} className="border-b border-line">
          <td className="px-3 py-2 font-semibold">{d.customerName}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(d.owed)}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(d.paid)}</td>
          <td className="px-3 py-2 font-semibold tabular-nums">{formatSYP(d.balance)}</td>
        </tr>
      ))}
      <tr className="bg-ground font-semibold">
        <td className="px-3 py-2">المجموع</td>
        <td />
        <td />
        <td className="px-3 py-2 tabular-nums">{formatSYP(total)}</td>
      </tr>
    </Table>
  );
}
