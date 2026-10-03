import type { StockMovementRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

/** The admin's stock entries in [from, to), newest first. */
export function useMovements(from: number, to: number): StockMovementRecord[] | undefined {
  const rows = useActiveRows(
    () => db.stockMovements.where('at').between(from, to, true, false).toArray(),
    [from, to],
  );
  return rows && [...rows].sort((a, b) => b.at - a.at);
}
