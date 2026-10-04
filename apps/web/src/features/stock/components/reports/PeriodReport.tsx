import { formatSYP } from '@carwash/shared';
import { ExportButton, Table } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import type { ReportColumn } from '../../lib/report-columns';
import { columnTotal, reportRows, reportSheet } from '../../lib/report-rows';

interface PeriodReportProps {
  /** The Excel file, e.g. "الهدر 2026-10". */
  fileName: string;
  /** The sheet's title, e.g. "الهدر: تشرين الأول 2026". */
  title: string;
  columns: ReportColumn[];
  from: number;
  to: number;
}

const show = (value: number | null, money?: boolean) =>
  value === null ? '—' : money ? formatSYP(value) : String(value);

/** One row per product for a day or a month, with the money columns added up. */
export function PeriodReport({ fileName, title, columns, from, to }: PeriodReportProps) {
  const { products, ledger } = useStock();
  const rows = reportRows(products, ledger, from, to);

  if (rows.length === 0) return <p className="text-muted">لا توجد أصناف بعد.</p>;
  return (
    <div className="flex flex-col gap-2">
      <div className="self-end">
        <ExportButton fileName={fileName} sheets={() => [reportSheet(title, columns, rows)]} />
      </div>
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
              {c.money ? formatSYP(columnTotal(rows, c)) : ''}
            </td>
          ))}
        </tr>
      </Table>
    </div>
  );
}
