import {
  formatSYP,
  REVENUE_SOURCE_LABELS,
  REVENUE_SOURCES,
  totalOf,
  type RevenueBySource,
} from '@carwash/shared';
import { Table } from '../../../shared/ui';

const share = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 100)}%` : '—';

/** Where the month's income came from. */
export function RevenueTable({ revenue }: { revenue: RevenueBySource }) {
  const total = totalOf(revenue);
  return (
    <Table headers={['المصدر', 'الدخل', 'النسبة']} minWidth="24rem">
      {REVENUE_SOURCES.map((source) => (
        <tr key={source} className="border-b border-line">
          <td className="px-3 py-2 font-semibold">{REVENUE_SOURCE_LABELS[source]}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(revenue[source])}</td>
          <td className="px-3 py-2 tabular-nums text-muted">{share(revenue[source], total)}</td>
        </tr>
      ))}
      <tr className="bg-ground font-semibold">
        <td className="px-3 py-2">المجموع</td>
        <td className="px-3 py-2 tabular-nums">{formatSYP(total)}</td>
        <td />
      </tr>
    </Table>
  );
}
