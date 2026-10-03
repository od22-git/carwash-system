import type { ProductKind } from '@carwash/shared';
import { useSessionUser } from '../../../core/auth';
import { stockRow } from '../lib/stock-rows';
import type { StockContextValue } from './stock-context';
import { useProducts } from './use-products';
import { useStockLedger } from './use-stock-ledger';

/** Builds a stock screen's context. Null until everything is loaded. */
export function useStockContextValue(kinds: readonly ProductKind[]): StockContextValue | null {
  const user = useSessionUser();
  const products = useProducts(kinds);
  const ledger = useStockLedger();
  if (!user || !products || !ledger) return null;
  const rows = products.map((p) => stockRow(p, ledger.get(p.id)));
  return { user, kinds, products, rows, ledger };
}

/** How many active products of these kinds are low or out (the menu's alert). */
export function useLowStockCount(kinds: readonly ProductKind[]): number {
  const products = useProducts(kinds);
  const ledger = useStockLedger();
  if (!products || !ledger) return 0;
  return products.filter((p) => p.active && stockRow(p, ledger.get(p.id)).status !== 'ok').length;
}
