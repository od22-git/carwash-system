import { CAR_SIZE_LABELS, type VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Button, PlateChip } from '../../../shared/ui';
import { removeVehicle } from '../lib/customer-actions';
import { VehicleForm } from './VehicleForm';

interface CustomerVehiclesProps {
  customerId: string;
  vehicles: VehicleRecord[];
  allVehicles: VehicleRecord[];
  customerName: (customerId: string) => string;
}

/** The customer's cars, with add / edit / remove. `editing` is a car id, "new", or null. */
export function CustomerVehicles({
  customerId,
  vehicles,
  allVehicles,
  customerName,
}: CustomerVehiclesProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const formProps = { customerId, allVehicles, customerName, onDone: () => setEditing(null) };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">السيارات</h3>
      {vehicles.length === 0 && editing !== 'new' && (
        <p className="text-muted">لا توجد سيارات بعد. أضف سيارة العميل ليتمكّن من الغسيل.</p>
      )}
      <ul className="flex flex-col gap-2">
        {vehicles.map((v) =>
          editing === v.id ? (
            <li key={v.id}>
              <VehicleForm {...formProps} vehicle={v} />
            </li>
          ) : (
            <li
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <PlateChip plate={v.plate} />
                <span className="text-muted">
                  {[v.color, CAR_SIZE_LABELS[v.size]].filter(Boolean).join('، ')}
                </span>
              </span>
              <span className="flex gap-1">
                <Button variant="quiet" onClick={() => setEditing(v.id)}>
                  تعديل
                </Button>
                <Button variant="quiet" onClick={() => void removeVehicle(v.id)}>
                  حذف
                </Button>
              </span>
            </li>
          ),
        )}
      </ul>
      {editing === 'new' ? (
        <VehicleForm {...formProps} />
      ) : (
        <Button variant="secondary" className="self-start" onClick={() => setEditing('new')}>
          إضافة سيارة
        </Button>
      )}
    </section>
  );
}
