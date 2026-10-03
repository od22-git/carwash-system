import type { ProductKind } from '@carwash/shared';
import { useLowStockCount } from '../../features/stock';

/** A small count next to a menu item: products low or out, so the admin buys in time. */
export function StockAlert({ kinds }: { kinds: readonly ProductKind[] }) {
  const count = useLowStockCount(kinds);
  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} ناقص`}
      className="ms-2 inline-flex min-w-6 items-center justify-center rounded-full bg-status-washing px-1.5 text-xs font-bold text-white"
    >
      {count}
    </span>
  );
}
