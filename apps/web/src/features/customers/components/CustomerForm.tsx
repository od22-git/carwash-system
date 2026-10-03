import {
  findPossibleDuplicates,
  formatSyrianPhone,
  normalizeSyrianPhone,
  type CustomerRecord,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { createCustomer, updateCustomer, type CustomerInput } from '../lib/customer-actions';
import { DuplicateHint } from './DuplicateHint';

interface CustomerFormProps {
  /** Missing = new customer. */
  customer?: CustomerRecord;
  allCustomers: CustomerRecord[];
  onSaved: (customer: CustomerRecord) => void;
  onOpenCustomer: (id: string) => void;
  onCancel: () => void;
}

const toInput = (c?: CustomerRecord): CustomerInput => ({
  name: c?.name ?? '',
  job: c?.job ?? '',
  phone: c ? formatSyrianPhone(c.phone) : '',
  notes: c?.notes ?? '',
});

export function CustomerForm({
  customer,
  allCustomers,
  onSaved,
  onOpenCustomer,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] = useState(() => toInput(customer));
  const [phoneError, setPhoneError] = useState(false);
  const action = useAction();
  const set = (key: keyof CustomerInput) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  const others = allCustomers.filter((c) => c.id !== customer?.id);
  const hits = findPossibleDuplicates(form, others).filter(
    (h) => !customer || h.reason === 'same_phone',
  );
  const phoneTaken = hits.some((h) => h.reason === 'same_phone');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validPhone = normalizeSyrianPhone(form.phone) !== null;
    setPhoneError(!validPhone);
    if (!validPhone || phoneTaken) return;
    let saved: CustomerRecord | undefined;
    const ok = await action.run(async () => {
      saved = customer ? await updateCustomer(customer.id, form) : await createCustomer(form);
    });
    if (ok && saved) onSaved(saved);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم العميل" required value={form.name} onChange={set('name')} />
        <Field
          label="رقم الهاتف (واتساب)"
          ltr
          required
          inputMode="tel"
          value={form.phone}
          onChange={set('phone')}
          hint="مثل 0933 123 456"
        />
        <Field label="المهنة" value={form.job} onChange={set('job')} />
        <Field label="ملاحظات" value={form.notes} onChange={set('notes')} />
      </div>
      <DuplicateHint hits={hits} onOpen={onOpenCustomer} />
      {phoneError && (
        <Notice tone="error">رقم الهاتف غير صحيح. اكتب رقم موبايل سوري، مثل 0933 123 456.</Notice>
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy || phoneTaken}>
          {customer ? 'حفظ التعديلات' : 'حفظ العميل'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
