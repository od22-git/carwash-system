import type { PackageRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Checkbox, Field, Notice } from '../../../../shared/ui';
import { useCatalog } from '../../../catalog';
import { savePackage, type PackageInput } from '../../lib/package-actions';
import { ServiceChecklist } from './ServiceChecklist';

const toInput = (p?: PackageRecord): PackageInput => ({
  name: p?.name ?? '',
  price: p ? p.price.toLocaleString('en-US') : '',
  days: p ? String(p.durationDays) : '30',
  freeWashes: p ? String(p.freeWashes) : '',
  washServiceIds: p?.washServiceIds ?? [],
  includesParking: p?.includesParking ?? false,
  active: p?.active ?? true,
});

interface PackageFormProps {
  pkg?: PackageRecord;
  packages: PackageRecord[];
  onDone: () => void;
}

export function PackageForm({ pkg, packages, onDone }: PackageFormProps) {
  const { services } = useCatalog();
  const [form, setForm] = useState(() => toInput(pkg));
  const action = useAction();
  const set =
    (key: 'name' | 'price' | 'days' | 'freeWashes') => (e: { target: { value: string } }) =>
      setForm({ ...form, [key]: e.target.value });
  const hasWashes = parseWholeNumber(form.freeWashes) > 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => savePackage(form, packages, pkg?.id))) onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="اسم الباقة" required value={form.name} onChange={set('name')} />
        <Field
          label="السعر (ل.س)"
          ltr
          inputMode="numeric"
          required
          value={form.price}
          onChange={set('price')}
        />
        <Field
          label="المدة (أيام)"
          ltr
          inputMode="numeric"
          required
          value={form.days}
          onChange={set('days')}
        />
        <Field
          label="عدد الغسلات المجانية"
          ltr
          inputMode="numeric"
          value={form.freeWashes}
          onChange={set('freeWashes')}
        />
      </div>
      {hasWashes && (
        <ServiceChecklist
          services={services.filter((s) => s.active)}
          selected={form.washServiceIds}
          onChange={(washServiceIds) => setForm({ ...form, washServiceIds })}
        />
      )}
      <Checkbox
        label="تشمل الكراج"
        hint="تركن السيارة في الكراج بلا رسوم طوال مدة الباقة."
        checked={form.includesParking}
        onChange={(includesParking) => setForm({ ...form, includesParking })}
      />
      {pkg && (
        <Checkbox
          label="متاحة للبيع"
          hint="الباقات المباعة سابقاً تبقى كما هي."
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
        />
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy}>
          {pkg ? 'حفظ الباقة' : 'إضافة الباقة'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
