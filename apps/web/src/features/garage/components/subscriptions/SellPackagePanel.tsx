import type { CustomerRecord, SubscriptionRecord, VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { Notice, RegisterPanel } from '../../../../shared/ui';
import { CarPicker } from '../../../customers';
import { PrintSubscriptionButton } from '../receipts/PrintButtons';
import { PackageOptions } from './PackageOptions';

type Car = { vehicle: VehicleRecord; customer: CustomerRecord };

/** Sell a package for a car: plate (or a new car), then the package. */
export function SellPackagePanel({ onClose }: { onClose: () => void }) {
  const [car, setCar] = useState<Car | null>(null);
  const [sold, setSold] = useState<SubscriptionRecord | null>(null);

  function done(sub: SubscriptionRecord) {
    setSold(sub);
    setCar(null);
  }

  return (
    <RegisterPanel title="بيع باقة" onClose={onClose}>
      {sold && (
        <div className="flex flex-wrap items-center gap-3">
          <Notice tone="success">
            بيعت باقة {sold.packageName} للسيارة {sold.plate}، الإيصال {sold.receiptNo}.
          </Notice>
          <PrintSubscriptionButton sub={sold} />
        </div>
      )}
      {car ? (
        <PackageOptions {...car} onSold={done} onChangeCar={() => setCar(null)} />
      ) : (
        <CarPicker onPick={(vehicle, customer) => setCar({ vehicle, customer })} />
      )}
    </RegisterPanel>
  );
}
