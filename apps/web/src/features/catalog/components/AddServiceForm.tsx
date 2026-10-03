import type { ServiceRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { addService } from '../lib/catalog-actions';

export function AddServiceForm({ services }: { services: ServiceRecord[] }) {
  const [name, setName] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => addService(name, services))) setName('');
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <Field
        label="خدمة جديدة"
        required
        minLength={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-64 flex-1"
      />
      <Button type="submit" disabled={action.busy}>
        إضافة الخدمة
      </Button>
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </form>
  );
}
