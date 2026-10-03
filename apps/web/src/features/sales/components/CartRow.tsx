import {
  formatSYP,
  SALE_MODE_LABELS,
  sellPrice,
  type ProductRecord,
  type SaleLine,
  type SaleMode,
} from '@carwash/shared';
import type { Dispatch } from 'react';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { itemKey, type CartAction } from '../lib/cart';

interface CartRowProps {
  line: SaleLine;
  product: ProductRecord;
  dispatch: Dispatch<CartAction>;
}

const step = 'size-8 rounded-md border border-line bg-surface font-bold hover:border-foam';
const cell = 'px-2 py-2';

export function CartRow({ line, product, dispatch }: CartRowProps) {
  const key = itemKey(line);
  const name = line.name;
  const modes = (['piece', 'carton'] as SaleMode[]).filter((m) => sellPrice(product, m) !== null);
  const setQty = (quantity: number) => dispatch({ type: 'quantity', key, quantity });

  return (
    <tr className="border-b border-line last:border-0">
      <td className={cell}>
        <span className="block font-semibold">{name}</span>
        <span className="text-sm text-muted tabular-nums">
          {formatSYP(line.unitPrice)} لل{SALE_MODE_LABELS[line.mode]}
        </span>
      </td>
      <td className={cell}>
        {modes.length > 1 ? (
          <select
            aria-label={`طريقة البيع: ${name}`}
            value={line.mode}
            onChange={(e) => dispatch({ type: 'mode', key, mode: e.target.value as SaleMode })}
            className="rounded-md border border-line bg-surface px-1 py-1"
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {SALE_MODE_LABELS[m]}
              </option>
            ))}
          </select>
        ) : (
          SALE_MODE_LABELS[line.mode]
        )}
      </td>
      <td className={cell}>
        <div className="flex items-center gap-1" dir="ltr">
          <button
            type="button"
            aria-label={`أنقص ${name}`}
            className={step}
            onClick={() => setQty(line.quantity - 1)}
          >
            −
          </button>
          <input
            aria-label={`الكمية: ${name}`}
            inputMode="numeric"
            value={line.quantity}
            onChange={(e) => setQty(parseWholeNumber(e.target.value) || 1)}
            className="w-12 rounded-md border border-line bg-surface px-1 py-1 text-center"
          />
          <button
            type="button"
            aria-label={`زد ${name}`}
            className={step}
            onClick={() => setQty(line.quantity + 1)}
          >
            +
          </button>
        </div>
      </td>
      <td className={`${cell} font-semibold tabular-nums`}>{formatSYP(line.total)}</td>
      <td className={cell}>
        <button
          type="button"
          aria-label={`حذف ${name}`}
          title="حذف"
          onClick={() => dispatch({ type: 'remove', key })}
          className="size-8 rounded-md text-xl leading-none text-muted hover:bg-status-grace/10 hover:text-status-grace"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
