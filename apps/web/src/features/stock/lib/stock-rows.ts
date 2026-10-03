import {
  averageUnitCost,
  levelAt,
  splitUnits,
  stockStatus,
  type LedgerEntry,
  type ProductRecord,
  type StockStatus,
} from '@carwash/shared';

/** One product as the stock table shows it. */
export interface StockRow {
  product: ProductRecord;
  level: number;
  cartons: number;
  pieces: number;
  status: StockStatus;
  /** Average purchase cost of one unit (SYP). */
  unitCost: number;
  /** What the units on the shelf cost (SYP). */
  value: number;
}

export function stockRow(product: ProductRecord, entries: LedgerEntry[] = []): StockRow {
  const level = levelAt(entries);
  const unitCost = averageUnitCost(entries);
  const { cartons, pieces } = splitUnits(Math.max(0, level), product.unitsPerCarton);
  return {
    product,
    level,
    cartons,
    pieces,
    status: stockStatus(level, product.minQty),
    unitCost,
    value: Math.round(Math.max(0, level) * unitCost),
  };
}

/** Active products running low or out, for the admin's alerts. */
export const lowRows = (rows: StockRow[]) =>
  rows.filter((r) => r.product.active && r.status !== 'ok');

/** "3 كرتونة و 5 قطعة", or just the units when not counted in cartons. */
export function describeLevel(row: Pick<StockRow, 'level' | 'cartons' | 'pieces' | 'product'>) {
  const { unit, unitsPerCarton } = row.product;
  if (unitsPerCarton <= 1 || row.level <= 0) return `${row.level} ${unit}`;
  return row.pieces === 0
    ? `${row.cartons} كرتونة`
    : `${row.cartons} كرتونة و ${row.pieces} ${unit}`;
}
