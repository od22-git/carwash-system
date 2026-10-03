import type { ProductRecord, SaleRecord } from '@carwash/shared';
import { useReducer, useState } from 'react';
import { useSessionUser } from '../../../core/auth';
import { startOfDay } from '../../../shared/lib/time-format';
import { useAction } from '../../../shared/lib/use-action';
import { useNow } from '../../../shared/lib/use-now';
import { Notice, PageHeader } from '../../../shared/ui';
import { Cart } from '../components/Cart';
import { PrintSaleButton } from '../components/PrintSaleButton';
import { ProductSearch } from '../components/ProductSearch';
import { QuickProducts } from '../components/QuickProducts';
import { SalesToday } from '../components/SalesToday';
import { useSellableProducts } from '../hooks/use-sales-data';
import { cartLines, cartReducer } from '../lib/cart';
import { completeSale } from '../lib/sale-actions';

const MINUTE = 60_000;

/** The counter: scan or tap products, check out, print. Works offline. */
export function SalesPage() {
  const user = useSessionUser();
  const products = useSellableProducts();
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [sold, setSold] = useState<SaleRecord | null>(null);
  const action = useAction();
  const today = startOfDay(useNow(MINUTE));
  if (!user || !products) return null;
  const lines = cartLines(cart, products);

  async function checkout() {
    const ok = await action.run(async () => setSold(await completeSale(lines)));
    if (ok) dispatch({ type: 'clear' });
  }

  function add(product: ProductRecord) {
    setSold(null);
    dispatch({ type: 'add', product });
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="البيع والبوفيه" />
      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-muted">
          لا توجد أصناف للبيع بعد. يضيفها المسؤول من شاشة المخزون مع أسعارها.
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="flex flex-col gap-6">
            <ProductSearch products={products} onAdd={add} />
            <QuickProducts products={products} onAdd={add} />
          </div>
          <section aria-label="السلة" className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold">السلة</h2>
            {sold && (
              <div className="flex flex-wrap items-center gap-3">
                <Notice tone="success">تم البيع، الإيصال {sold.receiptNo}.</Notice>
                <PrintSaleButton sale={sold} />
              </div>
            )}
            <Cart
              lines={lines}
              products={products}
              dispatch={dispatch}
              busy={action.busy}
              error={action.error}
              onCheckout={() => void checkout()}
            />
          </section>
        </div>
      )}
      <SalesToday today={today} user={user} />
    </div>
  );
}
