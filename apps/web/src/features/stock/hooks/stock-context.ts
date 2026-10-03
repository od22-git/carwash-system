import type { LedgerEntry, ProductKind, ProductRecord, SessionUser } from '@carwash/shared';
import { createContext, useContext } from 'react';
import type { StockRow } from '../lib/stock-rows';

/** What the stock and waste screens' parts need, gathered once by the page. */
export interface StockContextValue {
  user: SessionUser;
  /** The kinds this screen manages (wash materials, or car products + buffet). */
  kinds: readonly ProductKind[];
  /** Those products, stopped ones included. */
  products: ProductRecord[];
  rows: StockRow[];
  ledger: Map<string, LedgerEntry[]>;
}

export const StockContext = createContext<StockContextValue | null>(null);

export function useStock(): StockContextValue {
  const value = useContext(StockContext);
  if (!value) throw new Error('useStock must be used inside a stock page');
  return value;
}

export const productById = (ctx: StockContextValue, id: string) =>
  ctx.products.find((p) => p.id === id);
