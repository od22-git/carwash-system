import type { CustomerRecord, ParkingSessionRecord, VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Notice, RegisterPanel } from '../../../../shared/ui';
import { CarPicker } from '../../../customers';
import { PrintParkingButton } from '../receipts/PrintButtons';
import { ParkingOptions } from './ParkingOptions';

type Car = { vehicle: VehicleRecord; customer: CustomerRecord };

interface ParkCarPanelProps {
  parked: ParkingSessionRecord[];
  onClose: () => void;
}

/** A car comes into the garage: plate (or a new car), then the plan. */
export function ParkCarPanel({ parked, onClose }: ParkCarPanelProps) {
  const [car, setCar] = useState<Car | null>(null);
  const [created, setCreated] = useState<ParkingSessionRecord | null>(null);

  function done(session: ParkingSessionRecord) {
    setCreated(session);
    setCar(null);
  }

  return (
    <RegisterPanel title="سيارة تدخل الكراج" onClose={onClose}>
      {created && (
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="success">
            دخلت السيارة {created.plate} الكراج، الإيصال {created.receiptNo}.
          </Notice>
          <PrintParkingButton session={created} />
        </div>
      )}
      {car ? (
        <ParkingOptions {...car} parked={parked} onParked={done} onChangeCar={() => setCar(null)} />
      ) : (
        <CarPicker onPick={(vehicle, customer) => setCar({ vehicle, customer })} />
      )}
    </RegisterPanel>
  );
}
