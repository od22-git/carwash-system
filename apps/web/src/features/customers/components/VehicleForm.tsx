import { plateSearchKey, type CarSize, type VehicleRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { COMMON_COLORS } from '../lib/car-colors';
import { saveVehicle } from '../lib/customer-actions';
import { CarSizePicker } from './CarSizePicker';

interface VehicleFormProps {
  customerId: string;
  /** Missing = new car. */
  vehicle?: VehicleRecord;
  allVehicles: VehicleRecord[];
  customerName: (customerId: string) => string;
  onDone: () => void;
}

export function VehicleForm({
  customerId,
  vehicle,
  allVehicles,
  customerName,
  onDone,
}: VehicleFormProps) {
  const [plate, setPlate] = useState(vehicle?.plate ?? '');
  const [color, setColor] = useState(vehicle?.color ?? '');
  const [size, setSize] = useState<CarSize | null>(vehicle?.size ?? null);
  const [missingSize, setMissingSize] = useState(false);
  const action = useAction();

  const key = plateSearchKey(plate);
  const owner = key
    ? allVehicles.find((v) => v.id !== vehicle?.id && plateSearchKey(v.plate) === key)
    : undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMissingSize(!size);
    if (!size || owner) return;
    if (await action.run(() => saveVehicle(customerId, { plate, color, size }, vehicle?.id)))
      onDone();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-lg border border-line bg-ground p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="رقم اللوحة"
          required
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          hint="مثل: حلب 123456"
        />
        <Field
          label="اللون"
          list="car-colors"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <datalist id="car-colors">
          {COMMON_COLORS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <CarSizePicker value={size} onChange={setSize} />
      {owner && (
        <Notice tone="error">
          هذه اللوحة مسجّلة لسيارة العميل «{customerName(owner.customerId)}».
        </Notice>
      )}
      {missingSize && <Notice tone="error">اختر حجم السيارة، فالسعر يعتمد عليه.</Notice>}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-3">
        <Button type="submit" disabled={action.busy || Boolean(owner)}>
          {vehicle ? 'حفظ السيارة' : 'إضافة السيارة'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
