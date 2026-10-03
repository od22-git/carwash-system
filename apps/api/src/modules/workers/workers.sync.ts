import { PAY_FIELDS, workerPaymentRecordSchema, workerRecordSchema } from '@carwash/shared';
import type { SyncEntry, WireRow } from '../sync';
import { workerPayments, workers } from './workers.schema';

/** The cashier picks a worker for each car but never sees how workers are paid. */
function hidePayFromCashier(row: WireRow, user: { role: string }): WireRow {
  if (user.role === 'admin') return row;
  const visible = { ...row };
  PAY_FIELDS.forEach((field) => delete visible[field]);
  return visible;
}

export const workersSync: SyncEntry = {
  name: 'workers',
  table: workers,
  schema: workerRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin', 'user'],
  project: hidePayFromCashier,
};

/** What workers were given (advances, wages): only the admin writes and sees it. */
export const workerPaymentsSync: SyncEntry = {
  name: 'workerPayments',
  table: workerPayments,
  schema: workerPaymentRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin'],
  pullRoles: ['admin'],
};
