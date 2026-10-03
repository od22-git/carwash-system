import type { CustomerRecord, ParkingSessionRecord, VehicleRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { formatDate } from '../../../../shared/lib/time-format';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../../shared/ui';
import { CarHeader } from '../../../customers';
import { useGarage } from '../../hooks/garage-context';
import { useParkingPlans } from '../../hooks/use-garage-catalog';
import { useVehicleSubscription } from '../../hooks/use-subscriptions';
import { HOURLY_CHOICE, parkCar, planChoice } from '../../lib/parking-actions';
import { HOURLY_ID, PlanPicker } from './PlanPicker';

interface ParkingOptionsProps {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  parked: ParkingSessionRecord[];
  onParked: (session: ParkingSessionRecord) => void;
  onChangeCar: () => void;
}

/** The plan (unless the car's package covers the garage), then the car is in. */
export function ParkingOptions({ customer, vehicle, parked, ...props }: ParkingOptionsProps) {
  const { garage } = useGarage();
  const plans = useParkingPlans().plans.filter((p) => p.active);
  const [openedAt] = useState(Date.now);
  const current = useVehicleSubscription(vehicle.id, openedAt);
  const [planId, setPlanId] = useState(HOURLY_ID);
  const [notes, setNotes] = useState('');
  const action = useAction();
  if (current === undefined) return null;

  const cover = current?.subscription.includesParking ? current.subscription : null;
  const picked = plans.find((p) => p.id === planId);
  const choice = !cover && picked ? planChoice(picked) : HOURLY_CHOICE;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = { customer, vehicle, choice, coveredUntil: cover?.endsAt ?? null, notes };
    await action.run(async () => props.onParked(await parkCar(input)));
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <CarHeader vehicle={vehicle} customer={customer} onChangeCar={props.onChangeCar} />
      {parked.some((s) => s.vehicleId === vehicle.id) && (
        <Notice tone="error">هذه السيارة في الكراج الآن. تأكد قبل تسجيلها مرة ثانية.</Notice>
      )}
      {cover ? (
        <Notice tone="success">
          الكراج مشمول بباقة {cover.packageName} حتى {formatDate(cover.endsAt)}، وبعدها يُحسب
          بالساعة.
        </Notice>
      ) : (
        <PlanPicker plans={plans} settings={garage} value={planId} onChange={setPlanId} />
      )}
      <Field label="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        تسجيل دخول الكراج
      </Button>
    </form>
  );
}
