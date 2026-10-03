import { CAR_SIZE_LABELS, type CustomerRecord, type VehicleRecord } from '@carwash/shared';
import { Button, PlateChip } from '../../../../shared/ui';

interface CarHeaderProps {
  vehicle: VehicleRecord;
  customer: CustomerRecord;
  onChangeCar: () => void;
}

/** The picked car at the top of a form, with a way back to the plate search. */
export function CarHeader({ vehicle, customer, onChangeCar }: CarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PlateChip plate={vehicle.plate} size="lg" />
      <span className="font-semibold">{customer.name}</span>
      <span className="text-muted">{CAR_SIZE_LABELS[vehicle.size]}</span>
      <Button variant="quiet" onClick={onChangeCar}>
        تغيير السيارة
      </Button>
    </div>
  );
}
