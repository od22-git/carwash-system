import { buildLedger, type LedgerEntry } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';

/**
 * Every product's stock changes: the admin's movements and both laptops' sales.
 * Recomputed whenever either changes (here or synced from the other laptop).
 */
export function useStockLedger(): Map<string, LedgerEntry[]> | undefined {
  return useLiveQuery(async () => {
    const [movements, sales] = await Promise.all([db.stockMovements.toArray(), db.sales.toArray()]);
    return buildLedger(movements, sales);
  });
}
