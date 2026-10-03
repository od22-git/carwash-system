import { plateSearchKey, type CustomerRecord, type VehicleRecord } from '@carwash/shared';
import { useEffect, useState } from 'react';
import { Button, Field, PlateChip } from '../../../../shared/ui';

interface PlateLookupProps {
  vehicles: VehicleRecord[];
  customers: CustomerRecord[];
  /** The car list is still being read from the laptop's database. */
  loading: boolean;
  onPick: (vehicle: VehicleRecord, customer: CustomerRecord) => void;
  onNewCar: (plate: string) => void;
}

const MAX_SUGGESTIONS = 6;

/** The plate. A known car brings its customer; an unknown one starts a new car. */
export function PlateLookup({ vehicles, customers, loading, onPick, onNewCar }: PlateLookupProps) {
  const [plate, setPlate] = useState('');
  // Enter pressed before the car list arrived: pick the car as soon as it does.
  const [enterPending, setEnterPending] = useState(false);
  const key = plateSearchKey(plate);
  const owner = (v: VehicleRecord) => customers.find((c) => c.id === v.customerId);
  const matches =
    key.length >= 2
      ? vehicles
          .filter((v) => plateSearchKey(v.plate).includes(key) && owner(v))
          .slice(0, MAX_SUGGESTIONS)
      : [];
  const exact = matches.find((v) => plateSearchKey(v.plate) === key);

  useEffect(() => {
    if (!enterPending || loading) return;
    setEnterPending(false);
    if (exact) onPick(exact, owner(exact)!);
  });

  function confirm() {
    if (exact) onPick(exact, owner(exact)!);
    else if (loading) setEnterPending(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="رقم اللوحة"
        autoFocus
        value={plate}
        onChange={(e) => {
          setPlate(e.target.value);
          setEnterPending(false);
        }}
        onKeyDown={(e) => e.key === 'Enter' && confirm()}
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
      {key.length >= 2 && loading && (
        <p role="status" className="text-sm text-muted">
          جارٍ البحث عن اللوحة…
        </p>
      )}
      {/* Only offered once the search is complete, so a known car is never added twice. */}
      {key.length >= 2 && !loading && !exact && (
        <Button variant="secondary" className="self-start" onClick={() => onNewCar(plate)}>
          سيارة جديدة بهذه اللوحة
        </Button>
      )}
    </div>
  );
}
