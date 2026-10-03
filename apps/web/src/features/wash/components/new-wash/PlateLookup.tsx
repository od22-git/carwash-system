import { plateSearchKey, type CustomerRecord, type VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Button, Field, PlateChip } from '../../../../shared/ui';

interface PlateLookupProps {
  vehicles: VehicleRecord[];
  customers: CustomerRecord[];
  onPick: (vehicle: VehicleRecord, customer: CustomerRecord) => void;
  onNewCar: (plate: string) => void;
}

const MAX_SUGGESTIONS = 6;

/** Step 1: the plate. A known car brings its customer; an unknown one starts a new car. */
export function PlateLookup({ vehicles, customers, onPick, onNewCar }: PlateLookupProps) {
  const [plate, setPlate] = useState('');
  const key = plateSearchKey(plate);
  const owner = (v: VehicleRecord) => customers.find((c) => c.id === v.customerId);
  const matches =
    key.length >= 2
      ? vehicles
          .filter((v) => plateSearchKey(v.plate).includes(key) && owner(v))
          .slice(0, MAX_SUGGESTIONS)
      : [];
  const exact = matches.find((v) => plateSearchKey(v.plate) === key);

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="رقم اللوحة"
        autoFocus
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && exact && onPick(exact, owner(exact)!)}
        hint="اكتب جزءاً من الرقم للبحث، مثل 1234"
      />
      {matches.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="سيارات مطابقة">
          {matches.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onPick(v, owner(v)!)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-start hover:border-foam"
              >
                <PlateChip plate={v.plate} />
                <span className="font-semibold">{owner(v)!.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {key.length >= 2 && !exact && (
        <Button variant="secondary" className="self-start" onClick={() => onNewCar(plate)}>
          سيارة جديدة بهذه اللوحة
        </Button>
      )}
    </div>
  );
}
