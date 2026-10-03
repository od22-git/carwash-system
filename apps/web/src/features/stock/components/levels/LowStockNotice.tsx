import { Notice } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import { lowRows } from '../../lib/stock-rows';

/** Names what needs buying, so the admin sees it before it runs out. */
export function LowStockNotice() {
  const low = lowRows(useStock().rows);
  if (low.length === 0) return null;
  const out = low.filter((r) => r.status === 'out').map((r) => r.product.name);
  const short = low.filter((r) => r.status === 'low').map((r) => r.product.name);

  return (
    <Notice tone="warning">
      {out.length > 0 && <span className="block">نفد: {out.join('، ')}</span>}
      {short.length > 0 && <span className="block">قارب على النفاد: {short.join('، ')}</span>}
    </Notice>
  );
}
