import {
  PAY_TYPES,
  PAY_TYPE_LABELS,
  formatSyrianPhone,
  type PayType,
  type WorkerPublic,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Checkbox, Field, Notice } from '../../../shared/ui';
import { saveWorker, type WorkerInput } from '../lib/worker-actions';

const RATE_LABEL: Record<PayType, string> = {
  fixed_daily: 'الأجر اليومي (ل.س)',
  fixed_weekly: 'الأجر الأسبوعي (ل.س)',
  commission: 'نسبة العمولة من سعر الغسلة (%)',
};

const toInput = (w?: WorkerPublic): WorkerInput => ({
  name: w?.name ?? '',
  phone: w?.phone ? formatSyrianPhone(w.phone) : '',
  payType: w?.payType ?? 'commission',
  rate: w?.rate === undefined ? '' : String(w.rate),
  active: w?.active ?? true,
});

interface WorkerFormProps {
  worker?: WorkerPublic;
  onDone: () => void;
}

export function WorkerForm({ worker, onDone }: WorkerFormProps) {
  const [form, setForm] = useState(() => toInput(worker));
  const action = useAction();
  const set = (key: 'name' | 'phone' | 'rate') => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => saveWorker(form, worker?.id))) onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم العامل" required value={form.name} onChange={set('name')} />
        <Field label="رقم الهاتف" ltr inputMode="tel" value={form.phone} onChange={set('phone')} />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">نظام الأجر (واحد فقط)</legend>
        {PAY_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-2">
            <input
              type="radio"
              name="payType"
              className="accent-foam"
              checked={form.payType === type}
              onChange={() => setForm({ ...form, payType: type })}
            />
            {PAY_TYPE_LABELS[type]}
          </label>
        ))}
      </fieldset>
      <Field
        label={RATE_LABEL[form.payType]}
        ltr
        inputMode="decimal"
        required
        value={form.rate}
        onChange={set('rate')}
        className="max-w-xs"
      />
      {worker && (
        <Checkbox
          label="يعمل حالياً"
          hint="العامل الموقوف لا يظهر عند تسجيل سيارة جديدة."
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
        />
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy}>
          {worker ? 'حفظ التعديلات' : 'إضافة العامل'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
