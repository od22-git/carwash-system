import { formatSYP } from '@carwash/shared';
import { Button, Table } from '../../../../shared/ui';
import { describePay } from '../../lib/describe-pay';
import type { PayrollRow } from '../../lib/payroll';

interface PayrollTableProps {
  rows: PayrollRow[];
  onPay: (row: PayrollRow) => void;
}

const HEADERS = ['العامل', 'الأجر', 'السيارات', 'قيمة الغسيل', 'المستحق', 'المدفوع', 'الباقي', ''];

/** What each worker earned in the period, what they were given, and what is still owed. */
export function PayrollTable({ rows, onPay }: PayrollTableProps) {
  const total = (pick: (r: PayrollRow) => number) => rows.reduce((sum, r) => sum + pick(r), 0);
  const money = 'px-3 py-2 tabular-nums';

  return (
    <Table headers={HEADERS} minWidth="52rem">
      {rows.map((row) => (
        <tr key={row.worker.id} className="border-b border-line">
          <td className="px-3 py-2 font-semibold">{row.worker.name}</td>
          <td className="px-3 py-2">{describePay(row.worker)}</td>
          <td className={money}>{row.cars}</td>
          <td className={money}>{formatSYP(row.washRevenue)}</td>
          <td className={money}>{formatSYP(row.gross)}</td>
          <td className={money}>{formatSYP(row.paid)}</td>
          <td className={`${money} font-semibold ${row.due < 0 ? 'text-status-grace' : ''}`}>
            {formatSYP(row.due)}
          </td>
          <td className="px-3 py-1">
            <Button variant="quiet" onClick={() => onPay(row)}>
              دفع
            </Button>
          </td>
        </tr>
      ))}
      <tr className="bg-ground font-semibold">
        <td className="px-3 py-2">المجموع</td>
        <td />
        <td className={money}>{total((r) => r.cars)}</td>
        <td className={money}>{formatSYP(total((r) => r.washRevenue))}</td>
        <td className={money}>{formatSYP(total((r) => r.gross))}</td>
        <td className={money}>{formatSYP(total((r) => r.paid))}</td>
        <td className={money}>{formatSYP(total((r) => r.due))}</td>
        <td />
      </tr>
    </Table>
  );
}
