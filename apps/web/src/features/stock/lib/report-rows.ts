import {
  periodSummary,
  type LedgerEntry,
  type PeriodSummary,
  type ProductRecord,
} from '@carwash/shared';
import type { SheetSpec } from '../../../shared/lib/excel';
import type { ReportColumn } from './report-columns';

export interface ReportRow {
  product: ProductRecord;
  summary: PeriodSummary;
}

/** One row per product for [from, to); stopped products only if they still hold stock. */
export function reportRows(
  products: ProductRecord[],
  ledger: Map<string, LedgerEntry[]>,
  from: number,
  to: number,
): ReportRow[] {
  return products
    .map((product) => ({ product, summary: periodSummary(ledger.get(product.id) ?? [], from, to) }))
    .filter(({ product, summary }) => product.active || summary.opening || summary.closing);
}

export const columnTotal = (rows: ReportRow[], column: ReportColumn) =>
  rows.reduce((sum, r) => sum + (column.value(r.summary) ?? 0), 0);

/** The same report as a sheet; money columns are added up. */
export function reportSheet(title: string, columns: ReportColumn[], rows: ReportRow[]): SheetSpec {
  return {
    name: 'التقرير',
    title,
    columns: [{ header: 'الصنف' }, ...columns.map((c) => ({ header: c.header, money: c.money }))],
    rows: rows.map(({ product, summary }) => [
      product.name,
      ...columns.map((c) => c.value(summary)),
    ]),
    totals: ['المجموع', ...columns.map((c) => (c.money ? columnTotal(rows, c) : null))],
  };
}
