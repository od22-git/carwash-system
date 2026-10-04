export type Cell = string | number | null;

export interface SheetColumn {
  header: string;
  /** Amounts in SYP: thousands separators, "(ل.س)" in the header. */
  money?: boolean;
  /** Characters; by default fitted to the header and the values. */
  width?: number;
}

/** One sheet of an exported workbook: a title line, a table and an optional totals row. */
export interface SheetSpec {
  /** The tab name (Excel allows 31 characters). */
  name: string;
  /** Shown above the table, e.g. "الحسابات: 2026-10". */
  title?: string;
  columns: SheetColumn[];
  rows: Cell[][];
  totals?: Cell[];
}
