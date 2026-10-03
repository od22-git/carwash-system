import { PLAN_PRESETS, type ParkingPlanRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Checkbox, Field, Notice } from '../../../../shared/ui';
import { savePlan, type PlanInput } from '../../lib/plan-actions';

const toInput = (p?: ParkingPlanRecord): PlanInput => ({
  name: p?.name ?? '',
  hours: p ? String(p.durationHours) : '',
  price: p ? p.price.toLocaleString('en-US') : '',
  active: p?.active ?? true,
});

interface PlanFormProps {
  plan?: ParkingPlanRecord;
  plans: ParkingPlanRecord[];
  onDone: () => void;
}

export function PlanForm({ plan, plans, onDone }: PlanFormProps) {
  const [form, setForm] = useState(() => toInput(plan));
  const action = useAction();
  const set = (key: 'name' | 'hours' | 'price') => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => savePlan(form, plans, plan?.id))) onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-line p-4">
      {!plan && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">بداية سريعة:</span>
          {PLAN_PRESETS.map((p) => (
            <Button
              key={p.name}
              variant="secondary"
              onClick={() => setForm({ ...form, name: p.name, hours: String(p.durationHours) })}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="اسم الخطة" required value={form.name} onChange={set('name')} />
        <Field
          label="المدة (ساعات)"
          ltr
          inputMode="numeric"
          required
          value={form.hours}
          onChange={set('hours')}
        />
        <Field
          label="السعر (ل.س)"
          ltr
          inputMode="numeric"
          required
          value={form.price}
          onChange={set('price')}
        />
      </div>
      {plan && (
        <Checkbox
          label="متاحة"
          hint="الخطة الموقوفة لا تظهر عند إدخال سيارة جديدة."
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
        />
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy}>
          {plan ? 'حفظ الخطة' : 'إضافة الخطة'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
