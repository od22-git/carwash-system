import type { FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { saveSetting, type LoadedSetting } from '../hooks/use-setting';
import { useSyncedForm } from '../hooks/use-synced-form';

export function ReceiptSettingsForm({ setting }: { setting: LoadedSetting<'receipt'> }) {
  const [form, setForm] = useSyncedForm(setting.value, setting.version);
  const action = useAction();

  function submit(event: FormEvent) {
    event.preventDefault();
    void action.run(() => saveSetting('receipt', form));
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-5">
      <Field
        label="اسم المغسلة على الإيصال"
        required
        maxLength={80}
        value={form.shopName}
        onChange={(e) => setForm({ ...form, shopName: e.target.value })}
      />
      <Field
        label="العبارة في أسفل الإيصال"
        maxLength={200}
        value={form.footer}
        onChange={(e) => setForm({ ...form, footer: e.target.value })}
      />
      {action.error && <Notice tone="error">{action.error}</Notice>}
      {action.done && <Notice tone="success">حُفظت إعدادات الإيصال.</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        حفظ إعدادات الإيصال
      </Button>
    </form>
  );
}
