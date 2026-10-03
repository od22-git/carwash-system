import { formatSYP, saleTotal, type ProductRecord, type SaleLine } from '@carwash/shared';
import type { Dispatch } from 'react';
import { Button, Notice, Table } from '../../../shared/ui';
import type { CartAction } from '../lib/cart';
import { CartRow } from './CartRow';

interface CartProps {
  lines: SaleLine[];
  products: ProductRecord[];
  dispatch: Dispatch<CartAction>;
  busy: boolean;
  error: string | null;
  onCheckout: () => void;
}

/** What the customer is buying, the total, and the one button to finish. */
export function Cart({ lines, products, dispatch, busy, error, onCheckout }: CartProps) {
  if (lines.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line p-6 text-muted">
        السلة فارغة. امسح باركود الصنف أو اضغط عليه لإضافته.
      </p>
    );
  }
  const total = saleTotal(lines);

  return (
    <div className="flex flex-col gap-4">
      <Table headers={['الصنف', 'البيع', 'الكمية', 'المجموع', '']} minWidth="28rem">
        {lines.map((line) => (
          <CartRow
            key={`${line.productId}:${line.mode}`}
            line={line}
            product={products.find((p) => p.id === line.productId)!}
            dispatch={dispatch}
          />
        ))}
      </Table>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={busy} onClick={onCheckout} className="text-lg">
          إتمام البيع ({formatSYP(total)})
        </Button>
        <Button variant="secondary" onClick={() => dispatch({ type: 'clear' })}>
          إفراغ السلة
        </Button>
      </div>
    </div>
  );
}
