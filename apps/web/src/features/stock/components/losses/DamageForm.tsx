import { formatSYP } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { UserError } from '../../../../shared/lib/user-error';
import { Button, Field, Notice, SelectField } from '../../../../shared/ui';
import { productById, useStock } from '../../hooks/stock-context';
import { recordDamage } from '../../lib/movement-actions';

/** Units broken, expired or lost: they leave the stock at their average cost. */
export function DamageForm() {
  const ctx = useStock();
  const [productId, setProductId] = useState('');
  const [units, setUnits] = useState('');
  const [note, setNote] = useState('');
  const action = useAction();

  const product = productById(ctx, productId);
  const row = ctx.rows.find((r) => r.product.id === productId);
  const n = parseWholeNumber(units);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await action.run(async () => {
      if (!product || !row) throw new UserError('اختر الصنف.');
      if (!(n > 0)) throw new UserError('اكتب عدد الوحدات التالفة.');
      await recordDamage(product, n, row.unitCost, note);
    });
    if (ok) {
      setUnits('');
      setNote('');
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
      <Field
        label="عدد الوحدات التالفة"
        ltr
        inputMode="numeric"
        value={units}
        onChange={(e) => setUnits(e.target.value)}
        hint={row ? `في المخزون الآن ${row.level} ${row.product.unit}` : undefined}
      />
      <Field
        label="السبب (اختياري)"
        className="sm:col-span-2"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex flex-col gap-3 sm:col-span-2">
        {row && n > 0 && (
          <Notice>قيمة التالف حسب متوسط الكلفة: {formatSYP(n * row.unitCost)}.</Notice>
        )}
        {action.error && <Notice tone="error">{action.error}</Notice>}
        {action.done && <Notice tone="success">سُجّل التالف وخرج من المخزون.</Notice>}
        <Button type="submit" disabled={action.busy} className="self-start">
          تسجيل التالف
        </Button>
      </div>
    </form>
  );
}
