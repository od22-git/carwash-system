import { debtPaymentRecordSchema } from '@carwash/shared';
import { cashierCreatesOnly, type SyncEntry } from '../sync';
import { debtPayments } from './debts.schema';

/** Both laptops take payments; only the admin corrects or deletes one. */
export const debtPaymentsSync: SyncEntry = {
  name: 'debtPayments',
  table: debtPayments,
  schema: debtPaymentRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: cashierCreatesOnly,
};
