import { formatSYP } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { fromDateInput, toDateInput } from '../../../../shared/lib/date-input';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { UserError } from '../../../../shared/lib/user-error';
import { Button, ChoiceGroup, Field, Notice, SelectField } from '../../../../shared/ui';
import { productById, useStock } from '../../hooks/stock-context';
import { purchaseUnits, recordPurchase, type PurchaseMode } from '../../lib/movement-actions';

const MODES = [
  { value: 'carton' as const, label: 'بالكرتونة (جملة)' },
  { value: 'piece' as const, label: 'بالقطعة (مفرّق)' },
];

/** Stock arrives. The form stays open for the next item, keeping the date and supplier. */
export function PurchaseForm({ initialProductId = '' }: { initialProductId?: string }) {
  const ctx = useStock();
  const [productId, setProductId] = useState(initialProductId);
  const [mode, setMode] = useState<PurchaseMode>('carton');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [day, setDay] = useState(() => toDateInput(Date.now()));
  const [supplier, setSupplier] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const action = useAction();

  const product = productById(ctx, productId);
  const byCarton = mode === 'carton' && (product?.unitsPerCarton ?? 1) > 1;
  const qty = parseWholeNumber(quantity);
  const cost = parseWholeNumber(price);
  const units = product && qty > 0 ? purchaseUnits(product, byCarton ? 'carton' : 'piece', qty) : 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await action.run(async () => {
      if (!product) throw new UserError('اختر الصنف.');
      if (!(qty > 0) || Number.isNaN(cost)) throw new UserError('اكتب الكمية والسعر.');
      const input = { mode: byCarton ? 'carton' : 'piece', quantity: qty, price: cost } as const;
      await recordPurchase({
        product,
        ...input,
        at: fromDateInput(day, Date.now()),
        supplier,
        note: '',
      });
      setSaved(
        `سُجّل شراء ${units} ${product.unit} من ${product.name}، الكلفة ${formatSYP(qty * cost)}.`,
      );
    });
    if (ok) {
      setQuantity('');
      setPrice('');
    }
  }

  const options = ctx.products.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name }));
  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <SelectField
        label="الصنف"
        placeholder="اختر الصنف"
        options={options}
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />
      {(product?.unitsPerCarton ?? 1) > 1 && (
        <ChoiceGroup legend="طريقة الشراء" choices={MODES} value={mode} onChange={setMode} />
      )}
      <Field
        label={byCarton ? 'عدد الكراتين' : 'عدد القطع'}
        ltr
        inputMode="numeric"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <Field
        label={byCarton ? 'سعر الكرتونة (ل.س)' : 'سعر القطعة (ل.س)'}
        ltr
        inputMode="numeric"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Field label="التاريخ" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      <Field
        label="المورد (اختياري)"
        value={supplier}
        onChange={(e) => setSupplier(e.target.value)}
      />
      <div className="flex flex-col gap-3 sm:col-span-2">
        {product && units > 0 && cost >= 0 && (
          <Notice>
            سيُضاف {units} {product.unit}، والكلفة {formatSYP(qty * cost)}.
          </Notice>
        )}
        {action.error && <Notice tone="error">{action.error}</Notice>}
        {action.done && saved && <Notice tone="success">{saved}</Notice>}
        <Button type="submit" disabled={action.busy} className="self-start">
          تسجيل الشراء
        </Button>
      </div>
    </form>
  );
}
