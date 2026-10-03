import {
  formatSYP,
  nextSubscriptionStart,
  subscriptionEnd,
  type CustomerRecord,
  type SubscriptionRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { formatDate } from '../../../../shared/lib/time-format';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Notice } from '../../../../shared/ui';
import { CarHeader } from '../../../customers';
import { usePackages } from '../../hooks/use-garage-catalog';
import { useCarSubscriptions } from '../../hooks/use-subscriptions';
import { sellPackage } from '../../lib/subscription-actions';
import { PackagePicker } from './PackagePicker';

interface PackageOptionsProps {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  onSold: (sub: SubscriptionRecord) => void;
  onChangeCar: () => void;
}

/** Pick the package; a car that still has one renews from its end date. */
export function PackageOptions({ customer, vehicle, onSold, onChangeCar }: PackageOptionsProps) {
  const packages = usePackages().packages.filter((p) => p.active);
  const carSubs = useCarSubscriptions(vehicle.id);
  const [openedAt] = useState(Date.now);
  const [packageId, setPackageId] = useState<string | null>(null);
  const action = useAction();
  if (!carSubs) return null;

  const pkg = packages.find((p) => p.id === packageId);
  const startsAt = nextSubscriptionStart(carSubs, vehicle.id, openedAt);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pkg || !carSubs) return;
    const start = nextSubscriptionStart(carSubs, vehicle.id, Date.now());
    await action.run(async () =>
      onSold(await sellPackage({ customer, vehicle, pkg, startsAt: start })),
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <CarHeader vehicle={vehicle} customer={customer} onChangeCar={onChangeCar} />
      {startsAt > openedAt && (
        <Notice>
          لهذه السيارة باقة حتى {formatDate(startsAt)}، والباقة الجديدة تبدأ بعد انتهائها.
        </Notice>
      )}
      {packages.length === 0 ? (
        <Notice tone="error">لا توجد باقات بعد. يضيفها المسؤول من صفحة الباقات وخطط الكراج.</Notice>
      ) : (
        <PackagePicker packages={packages} value={packageId} onChange={setPackageId} />
      )}
      {pkg && (
        <p className="text-muted">
          من {formatDate(startsAt)} حتى {formatDate(subscriptionEnd(startsAt, pkg.durationDays))}
        </p>
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <Button type="submit" disabled={!pkg || action.busy} className="self-start">
        {pkg ? `بيع الباقة (${formatSYP(pkg.price)})` : 'بيع الباقة'}
      </Button>
    </form>
  );
}
