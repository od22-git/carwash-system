import type { CustomerRecord, VehicleRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

export interface CustomerDirectory {
  customers: CustomerRecord[];
  vehicles: VehicleRecord[];
  loading: boolean;
}

/** All customers and cars on this laptop, live. Updates when the other laptop syncs. */
export function useCustomerDirectory(): CustomerDirectory {
  const customers = useActiveRows(() => db.customers.toArray());
  const vehicles = useActiveRows(() => db.vehicles.toArray());
  return {
    customers: customers ?? [],
    vehicles: vehicles ?? [],
    loading: customers === undefined || vehicles === undefined,
  };
}
