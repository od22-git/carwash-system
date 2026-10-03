import { SELLABLE_KINDS, sellPrice, type ProductRecord, type SaleRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';
import { useProducts } from '../../stock';

/** Products the counter can sell now: active, with a piece or carton price. */
export function useSellableProducts(): ProductRecord[] | undefined {
  return useProducts(SELLABLE_KINDS)?.filter(
    (p) => p.active && (sellPrice(p, 'piece') !== null || sellPrice(p, 'carton') !== null),
  );
}

/** Sales since `from` (both laptops), newest first; cancelled ones included. */
export function useSalesSince(from: number): SaleRecord[] | undefined {
  const rows = useActiveRows(() => db.sales.where('soldAt').aboveOrEqual(from).toArray(), [from]);
  return rows && [...rows].sort((a, b) => b.soldAt - a.soldAt);
}
