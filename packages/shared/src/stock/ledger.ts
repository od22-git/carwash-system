import type { SYP } from '../common';
import type { SaleRecord } from './sale-record';
import type { MovementType, StockMovementRecord } from './stock-movement-record';

export type LedgerEntryType = MovementType | 'sale';

/** One change to a product's stock, from a movement or from a sale receipt. */
export interface LedgerEntry {
  type: LedgerEntryType;
  at: number;
  /** Units in (+) or out (−). */
  qty: number;
  /** Cost value of the change (purchases, losses); 0 for sales. */
  value: SYP;
  /** What the customer paid (sales only). */
  revenue: SYP;
  /** For counts: the units found. */
  counted: number | null;
}

type Movement = Pick<
  StockMovementRecord,
  'productId' | 'type' | 'qty' | 'value' | 'counted' | 'at' | 'deletedAt'
>;
type Sale = Pick<SaleRecord, 'status' | 'lines' | 'soldAt' | 'deletedAt'>;

function add(ledger: Map<string, LedgerEntry[]>, productId: string, entry: LedgerEntry) {
  const entries = ledger.get(productId) ?? [];
  entries.push(entry);
  ledger.set(productId, entries);
}

/**
 * Every product's stock changes, oldest first. Deleted movements and cancelled sales
 * are left out, so cancelling a sale puts its units back on the shelf.
 */
export function buildLedger(movements: Movement[], sales: Sale[]): Map<string, LedgerEntry[]> {
  const ledger = new Map<string, LedgerEntry[]>();
  for (const m of movements) {
    if (m.deletedAt) continue;
    const { type, at, qty, value, counted } = m;
    add(ledger, m.productId, { type, at, qty, value, revenue: 0, counted });
  }
  for (const sale of sales) {
    if (sale.deletedAt || sale.status === 'cancelled') continue;
    for (const line of sale.lines) {
      const entry = { type: 'sale' as const, at: sale.soldAt, qty: -line.units, value: 0 };
      add(ledger, line.productId, { ...entry, revenue: line.total, counted: null });
    }
  }
  for (const entries of ledger.values()) entries.sort((a, b) => a.at - b.at);
  return ledger;
}

const before = (entries: LedgerEntry[], until: number) => entries.filter((e) => e.at < until);

/** Units on the shelf just before `until` (now when omitted). */
export function levelAt(entries: LedgerEntry[], until = Infinity): number {
  return before(entries, until).reduce((sum, e) => sum + e.qty, 0);
}

/** Average cost of one unit from all purchases before `until`. 0 before any purchase. */
export function averageUnitCost(entries: LedgerEntry[], until = Infinity): number {
  const purchases = before(entries, until).filter((e) => e.type === 'purchase');
  const units = purchases.reduce((sum, e) => sum + e.qty, 0);
  const cost = purchases.reduce((sum, e) => sum + e.value, 0);
  return units === 0 ? 0 : cost / units;
}
