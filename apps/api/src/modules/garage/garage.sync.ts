import { parkingPlanRecordSchema, parkingSessionRecordSchema } from '@carwash/shared';
import { receiptRules, type SyncEntry } from '../sync';
import { parkingPlans, parkingSessions } from './garage.schema';

/** The admin sets the plans; the cashier needs them to park a car offline. */
export const parkingPlansSync: SyncEntry = {
  name: 'parkingPlans',
  table: parkingPlans,
  schema: parkingPlanRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};

export const parkingSessionsSync: SyncEntry = {
  name: 'parkingSessions',
  table: parkingSessions,
  schema: parkingSessionRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: receiptRules(['left', 'cancelled']),
};
