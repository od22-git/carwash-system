import { packageRecordSchema, subscriptionRecordSchema } from '@carwash/shared';
import { receiptRules, type SyncEntry } from '../sync';
import { packages, subscriptions } from './subscriptions.schema';

/** The admin defines packages; the cashier sells them. */
export const packagesSync: SyncEntry = {
  name: 'packages',
  table: packages,
  schema: packageRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
};

/** Once sold, only the admin changes or cancels a package. */
export const subscriptionsSync: SyncEntry = {
  name: 'subscriptions',
  table: subscriptions,
  schema: subscriptionRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: receiptRules(['active', 'cancelled']),
};
