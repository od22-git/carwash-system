import {
  auditEventRecordSchema,
  customerRecordSchema,
  packageRecordSchema,
  parkingPlanRecordSchema,
  parkingSessionRecordSchema,
  productRecordSchema,
  saleRecordSchema,
  servicePriceRecordSchema,
  serviceRecordSchema,
  settingRecordSchema,
  stockMovementRecordSchema,
  subscriptionRecordSchema,
  ticketRecordSchema,
  vehicleRecordSchema,
  workerRecordSchema,
} from '@carwash/shared';
import type { ZodType } from 'zod';
import type { SyncedTable } from './synced-tables';

/** The same schemas the server uses, so invalid data never reaches the outbox. */
export const RECORD_SCHEMAS: Record<SyncedTable, ZodType> = {
  settings: settingRecordSchema,
  customers: customerRecordSchema,
  vehicles: vehicleRecordSchema,
  services: serviceRecordSchema,
  servicePrices: servicePriceRecordSchema,
  workers: workerRecordSchema,
  tickets: ticketRecordSchema,
  auditEvents: auditEventRecordSchema,
  parkingPlans: parkingPlanRecordSchema,
  parkingSessions: parkingSessionRecordSchema,
  packages: packageRecordSchema,
  subscriptions: subscriptionRecordSchema,
  products: productRecordSchema,
  stockMovements: stockMovementRecordSchema,
  sales: saleRecordSchema,
};
