import { formatSYP, periodSummary } from '@carwash/shared';
import { Table } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import type { ReportColumn } from './report-columns';

interface PeriodReportProps {
  columns: ReportColumn[];
  from: number;
  to: number;
}

const show = (value: number | null, money?: boolean) =>
  value === null ? '—' : money ? formatSYP(value) : String(value);

/** One row per product for a day or a month, with the money columns added up. */
export function PeriodReport({ columns, from, to }: PeriodReportProps) {
  const { products, ledger } = useStock();
  const rows = products
    .map((product) => ({ product, summary: periodSummary(ledger.get(product.id) ?? [], from, to) }))
    .filter(({ product, summary }) => product.active || summary.opening || summary.closing);
  const total = (c: ReportColumn) => rows.reduce((sum, r) => sum + (c.value(r.summary) ?? 0), 0);

  if (rows.length === 0) return <p className="text-muted">لا توجد أصناف بعد.</p>;
  return (
    <Table headers={['الصنف', ...columns.map((c) => c.header)]} minWidth="48rem">
      {rows.map(({ product, summary }) => (
        <tr key={product.id} className="border-b border-line">
          <td className="px-3 py-2 font-semibold">{product.name}</td>
          {columns.map((c) => (
            <td key={c.header} className="px-3 py-2 tabular-nums">
              {show(c.value(summary), c.money)}
            </td>
          ))}
        </tr>
      ))}
      <tr className="bg-ground font-semibold">
        <td className="px-3 py-2">المجموع</td>
        {columns.map((c) => (
          <td key={c.header} className="px-3 py-2 tabular-nums">
            {c.money ? formatSYP(total(c)) : ''}
          </td>
        ))}
      </tr>
    </Table>
  );
}
