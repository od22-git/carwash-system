import { serviceRecordSchema, servicePriceRecordSchema } from '@carwash/shared';
import type { SyncEntry } from '../sync';
import { servicePrices, services } from './catalog.schema';

/** The admin sets services and prices; the cashier needs them to price a wash offline. */
export const servicesSync: SyncEntry = {
  name: 'services',
  table: services,
  schema: serviceRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};

export const servicePricesSync: SyncEntry = {
  name: 'servicePrices',
  table: servicePrices,
  schema: servicePriceRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};
