import { cashDifference, formatSYP } from '@carwash/shared';
import { Table } from '../../../shared/ui';
import { useMonthCloses } from '../hooks/use-month-closes';
import { DifferenceText } from './difference';

/** The admin's view of a month: each day's count and difference. */
export function MonthCloses({ month }: { month: string }) {
  const closes = useMonthCloses(month);
  if (!closes) return null;
  if (closes.length === 0) return <p className="text-muted">لا توجد أيام مغلقة في هذا الشهر.</p>;
  const total = closes.reduce((sum, c) => sum + cashDifference(c), 0);

  return (
    <Table headers={['اليوم', 'دخل الصندوق', 'المعدود', 'الفرق', 'أغلقه']} minWidth="34rem">
      {closes.map((c) => (
        <tr key={c.id} className="border-b border-line">
          <td className="px-3 py-2 tabular-nums">{c.day}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(c.expected)}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(c.counted)}</td>
          <td className="px-3 py-2">
            <DifferenceText value={cashDifference(c)} />
          </td>
          <td className="px-3 py-2">{c.closedBy}</td>
        </tr>
      ))}
      <tr className="bg-ground font-semibold">
        <td className="px-3 py-2">مجموع الفروق</td>
        <td />
        <td />
        <td className="px-3 py-2">
          <DifferenceText value={total} />
        </td>
        <td />
      </tr>
    </Table>
  );
}
