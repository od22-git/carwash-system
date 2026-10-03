import { garageSettingsSchema, type GarageSettings } from '@carwash/shared';
import type { FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Checkbox, Field, Notice } from '../../../shared/ui';
import { saveSetting, type LoadedSetting } from '../hooks/use-setting';
import { useSyncedForm } from '../hooks/use-synced-form';

export function GarageSettingsForm({ setting }: { setting: LoadedSetting<'garage'> }) {
  const [form, setForm] = useSyncedForm(setting.value, setting.version);
  const action = useAction();
  const setNumber = (key: keyof GarageSettings) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: Number(e.target.value) });

  function submit(event: FormEvent) {
    event.preventDefault();
    void action.run(() => saveSetting('garage', garageSettingsSchema.parse(form)));
  }

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-5 sm:grid-cols-2">
      <Field
        label="سعر ساعة الكراج (ل.س)"
        type="number"
        min={0}
        step={500}
        ltr
        required
        value={form.hourlyRate}
        onChange={setNumber('hourlyRate')}
      />
      <Field
        label="مهلة الاستلام بعد رسالة واتساب (دقيقة)"
        type="number"
        min={0}
        max={240}
        ltr
        required
        value={form.pickupGraceMinutes}
        onChange={setNumber('pickupGraceMinutes')}
      />
      <Field
        label="الوقت المجاني لاصطفاف الكراج (دقيقة)"
        type="number"
        min={0}
        max={240}
        ltr
        required
        value={form.parkingFreeMinutes}
        onChange={setNumber('parkingFreeMinutes')}
      />
      <div className="sm:col-span-2">
        <Checkbox
          label="عند التأخر، احسب الكراج من لحظة الرسالة"
          hint="إذا لم تُفعَّل، يُحسب فقط الوقت الذي بعد انتهاء المهلة."
          checked={form.chargeFromNotice}
          onChange={(chargeFromNotice) => setForm({ ...form, chargeFromNotice })}
        />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        {action.error && <Notice tone="error">{action.error}</Notice>}
        {action.done && <Notice tone="success">حُفظت إعدادات الكراج.</Notice>}
        <Button type="submit" disabled={action.busy} className="self-start">
          حفظ إعدادات الكراج
        </Button>
      </div>
    </form>
  );
}
