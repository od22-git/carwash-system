import { Field } from '../../../../shared/ui';
import type { ProductInput } from '../../lib/product-actions';

interface SellFieldsProps {
  form: ProductInput;
  set: (key: keyof ProductInput) => (e: { target: { value: string } }) => void;
  /** The carton price only makes sense when the product comes in cartons. */
  inCartons: boolean;
}

/** Barcode and selling prices: car products and buffet only. */
export function SellFields({ form, set, inCartons }: SellFieldsProps) {
  return (
    <>
      <Field
        label="الباركود"
        ltr
        value={form.barcode}
        onChange={set('barcode')}
        hint="امسحه بالقارئ أو اكتبه. اتركه فارغاً إذا لا يوجد."
      />
      <Field
        label="سعر القطعة (ل.س)"
        ltr
        inputMode="numeric"
        value={form.retailPrice}
        onChange={set('retailPrice')}
        hint="سعر البيع بالمفرّق"
      />
      {inCartons && (
        <Field
          label="سعر الكرتونة جملة (ل.س)"
          ltr
          inputMode="numeric"
          value={form.wholesalePrice}
          onChange={set('wholesalePrice')}
          hint="اتركه فارغاً إذا لا تُباع بالكرتونة"
        />
      )}
    </>
  );
}
