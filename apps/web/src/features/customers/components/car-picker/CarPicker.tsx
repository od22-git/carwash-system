import type { CustomerRecord, VehicleRecord } from '@carwash/shared';
import { useState } from 'react';
import { useCustomerDirectory } from '../../hooks/use-customer-directory';
import { NewCarForm } from './NewCarForm';
import { PlateLookup } from './PlateLookup';

interface CarPickerProps {
  onPick: (vehicle: VehicleRecord, customer: CustomerRecord) => void;
}

/**
 * First step of every car screen (wash, garage, package): find the car by its plate,
 * or register a new car and its customer.
 */
export function CarPicker({ onPick }: CarPickerProps) {
  const { customers, vehicles } = useCustomerDirectory();
  const [newPlate, setNewPlate] = useState<string | null>(null);

  return newPlate === null ? (
    <PlateLookup vehicles={vehicles} customers={customers} onPick={onPick} onNewCar={setNewPlate} />
  ) : (
    <NewCarForm
      plate={newPlate}
      customers={customers}
      onReady={onPick}
      onCancel={() => setNewPlate(null)}
    />
  );
}
