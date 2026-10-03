import { customerRecordSchema, vehicleRecordSchema } from '@carwash/shared';
import type { SyncEntry } from '../sync';
import { customers, vehicles } from './customers.schema';

/** The cashier registers customers and cars, so both roles can write them. */
export const customersSync: SyncEntry = {
  name: 'customers',
  table: customers,
  schema: customerRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
};

export const vehiclesSync: SyncEntry = {
  name: 'vehicles',
  table: vehicles,
  schema: vehicleRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
};
