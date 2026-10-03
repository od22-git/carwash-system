import { PRODUCT_KIND_LABELS, SELLABLE_KINDS, type ProductRecord } from '@carwash/shared';
import { priceLabel } from '../lib/price-label';

interface QuickProductsProps {
  products: ProductRecord[];
  onAdd: (product: ProductRecord) => void;
}

/** One tap per product, grouped: buffet first (sold most often), then car products. */
export function QuickProducts({ products, onAdd }: QuickProductsProps) {
  const groups = [...SELLABLE_KINDS]
    .reverse()
    .map((kind) => ({ kind, items: products.filter((p) => p.kind === kind) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ kind, items }) => (
        <section key={kind} aria-label={PRODUCT_KIND_LABELS[kind]} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted">{PRODUCT_KIND_LABELS[kind]}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
            {items.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onAdd(p)}
                className="flex flex-col items-start gap-0.5 rounded-lg border border-line bg-surface px-3 py-2.5 text-start hover:border-foam"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-muted tabular-nums">{priceLabel(p)}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
