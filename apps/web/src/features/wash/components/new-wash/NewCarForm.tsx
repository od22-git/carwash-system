import {
  normalizeSyrianPhone,
  type CarSize,
  type CustomerRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Field, Notice, PlateChip } from '../../../../shared/ui';
import { CarSizePicker, createCustomer, saveVehicle } from '../../../customers';

interface NewCarFormProps {
  plate: string;
  customers: CustomerRecord[];
  onReady: (vehicle: VehicleRecord, customer: CustomerRecord) => void;
  onCancel: () => void;
}

/** Step 1b: an unknown plate. The phone finds an existing customer, or a new one is made. */
export function NewCarForm({ plate, customers, onReady, onCancel }: NewCarFormProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState<CarSize | null>(null);
  const action = useAction();
  const normalized = normalizeSyrianPhone(phone);
  const existing = normalized ? customers.find((c) => c.phone === normalized) : undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!size || !normalized) return;
    await action.run(async () => {
      const customer = existing ?? (await createCustomer({ name, phone, job: '', notes: '' }));
      onReady(await saveVehicle(customer.id, { plate, color, size }), customer);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="flex items-center gap-2">
        سيارة جديدة: <PlateChip plate={plate} />
      </p>
      <Field
        label="هاتف العميل (واتساب)"
        ltr
        required
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        hint="إذا كان العميل مسجلاً يظهر اسمه"
      />
      {existing ? (
        <Notice>
          العميل: {existing.name} ({existing.code}). ستُضاف السيارة إليه.
        </Notice>
      ) : (
        <Field label="اسم العميل" required value={name} onChange={(e) => setName(e.target.value)} />
      )}
      {phone && !normalized && <Notice tone="error">رقم الهاتف غير صحيح، مثل 0933 123 456.</Notice>}
      <CarSizePicker value={size} onChange={setSize} />
      <Field label="اللون" value={color} onChange={(e) => setColor(e.target.value)} />
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy || !size || !normalized}>
          متابعة
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          رجوع
        </Button>
      </div>
    </form>
  );
}
