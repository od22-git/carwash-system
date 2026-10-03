import {
  isSellable,
  PRODUCT_KIND_LABELS,
  type ProductKind,
  type ProductRecord,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Checkbox, ChoiceGroup, Field, Notice } from '../../../../shared/ui';
import { useStock } from '../../hooks/stock-context';
import { saveProduct, type ProductInput } from '../../lib/product-actions';
import { SellFields } from './SellFields';

const money = (n: number) => (n > 0 ? n.toLocaleString('en-US') : '');

const emptyInput = (kind: ProductKind): ProductInput => ({
  kind,
  name: '',
  unit: '',
  unitsPerCarton: '1',
  barcode: '',
  retailPrice: '',
  wholesalePrice: '',
  minQty: '',
  active: true,
});

const toInput = (p: ProductRecord): ProductInput => ({
  ...p,
  unitsPerCarton: String(p.unitsPerCarton),
  retailPrice: money(p.retailPrice),
  wholesalePrice: money(p.wholesalePrice),
  minQty: String(p.minQty),
});

export function ProductForm({ product, onDone }: { product?: ProductRecord; onDone: () => void }) {
  const { kinds, products } = useStock();
  const [form, setForm] = useState(product ? toInput(product) : emptyInput(kinds[0]!));
  const action = useAction();
  const set = (key: keyof ProductInput) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });
  const inCartons = parseWholeNumber(form.unitsPerCarton) > 1;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => saveProduct(form, product?.id, products))) onDone();
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 sm:grid-cols-2">
      {kinds.length > 1 && !product && (
        <div className="sm:col-span-2">
          <ChoiceGroup
            legend="النوع"
            choices={kinds.map((k) => ({ value: k, label: PRODUCT_KIND_LABELS[k] }))}
            value={form.kind}
            onChange={(kind) => setForm({ ...form, kind })}
          />
        </div>
      )}
      <Field label="اسم الصنف" required value={form.name} onChange={set('name')} />
      <Field
        label="الوحدة"
        placeholder="قطعة"
        value={form.unit}
        onChange={set('unit')}
        hint="مثل قطعة، لتر، علبة"
      />
      <Field
        label="عدد الوحدات في الكرتونة"
        ltr
        inputMode="numeric"
        value={form.unitsPerCarton}
        onChange={set('unitsPerCarton')}
        hint="1 إذا لا يُشترى بالكرتونة"
      />
      <Field
        label="حد التنبيه (وحدات)"
        ltr
        inputMode="numeric"
        value={form.minQty}
        onChange={set('minQty')}
        hint="ينبّهك النظام عندما يصل المخزون إلى هذا العدد"
      />
      {isSellable(form.kind) && <SellFields form={form} set={set} inCartons={inCartons} />}
      {product && (
        <div className="sm:col-span-2">
          <Checkbox
            label="الصنف مستخدم"
            hint="أزل الإشارة لإيقاف الصنف: لا يظهر في البيع والجرد، وتبقى حركاته السابقة."
            checked={form.active}
            onChange={(active) => setForm({ ...form, active })}
          />
        </div>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2">
        {action.error && <Notice tone="error">{action.error}</Notice>}
        <div className="flex gap-2">
          <Button type="submit" disabled={action.busy}>
            {product ? 'حفظ التعديل' : 'إضافة الصنف'}
          </Button>
          <Button variant="secondary" onClick={onDone}>
            تراجع
          </Button>
        </div>
      </div>
    </form>
  );
}
