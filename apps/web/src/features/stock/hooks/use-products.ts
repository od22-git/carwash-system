import type { ProductKind, ProductRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

/** Products of these kinds (stopped ones included), sorted by name. `undefined` while loading. */
export function useProducts(kinds: readonly ProductKind[]): ProductRecord[] | undefined {
  const rows = useActiveRows(
    () =>
      db.products
        .where('kind')
        .anyOf([...kinds])
        .toArray(),
    [kinds.join()],
  );
  return rows && [...rows].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
