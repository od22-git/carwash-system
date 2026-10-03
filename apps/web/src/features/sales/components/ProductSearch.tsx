import type { ProductRecord } from '@carwash/shared';
import { useState } from 'react';
import { Field, Notice } from '../../../shared/ui';
import { findByBarcode, searchProducts } from '../lib/find-product';
import { priceLabel } from '../lib/price-label';

interface ProductSearchProps {
  products: ProductRecord[];
  onAdd: (product: ProductRecord) => void;
}

/**
 * The barcode scanner types the code and presses Enter, so the field is focused and
 * cleared after every item. Typing part of a name lists matching products.
 */
export function ProductSearch({ products, onAdd }: ProductSearchProps) {
  const [text, setText] = useState('');
  const [notFound, setNotFound] = useState<string | null>(null);
  const matches = searchProducts(products, text);

  function add(product: ProductRecord) {
    onAdd(product);
    setText('');
    setNotFound(null);
  }

  function confirm() {
    const product =
      findByBarcode(products, text) ?? (matches.length === 1 ? matches[0] : undefined);
    if (product) add(product);
    else if (matches.length === 0 && text.trim()) setNotFound(text.trim());
  }

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="امسح الباركود أو ابحث بالاسم"
        autoFocus
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setNotFound(null);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          confirm();
        }}
      />
      {notFound && <Notice tone="error">لا يوجد صنف بالباركود أو الاسم «{notFound}».</Notice>}
      {text.trim() && matches.length > 0 && (
        <ul aria-label="أصناف مطابقة" className="flex flex-col gap-2">
          {matches.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => add(p)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-start hover:border-foam"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-muted tabular-nums">{priceLabel(p)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
