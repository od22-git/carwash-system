import { fillTemplate } from '@carwash/shared';
import { useId, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Notice } from '../../../shared/ui';
import { saveSetting, type LoadedSetting } from '../hooks/use-setting';
import { useSyncedForm } from '../hooks/use-synced-form';

const EXAMPLE = { name: 'سامر', plate: 'حلب 123456', grace: 15 };

export function WhatsappSettingsForm({ setting }: { setting: LoadedSetting<'whatsapp'> }) {
  const [template, setTemplate] = useSyncedForm(setting.value.readyTemplate, setting.version);
  const action = useAction();
  const id = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    void action.run(() => saveSetting('whatsapp', { readyTemplate: template }));
  }

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-4">
      <label htmlFor={id} className="text-sm font-semibold">
        نص رسالة «السيارة جاهزة»
      </label>
      <textarea
        id={id}
        rows={3}
        required
        maxLength={500}
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2.5 focus:border-foam"
      />
      <p className="text-sm text-muted">
        يُستبدل {'{name}'} باسم العميل، و{'{plate}'} برقم اللوحة، و{'{grace}'} بدقائق المهلة.
      </p>
      <p className="rounded-lg bg-ground px-4 py-3 text-sm">
        <span className="text-muted">مثال: </span>
        {fillTemplate(template, EXAMPLE)}
      </p>
      {action.error && <Notice tone="error">{action.error}</Notice>}
      {action.done && <Notice tone="success">حُفظ نص الرسالة.</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        حفظ نص الرسالة
      </Button>
    </form>
  );
}
