import { cashCloseRecordSchema } from '@carwash/shared';
import { cashierCreatesOnly, type SyncEntry } from '../sync';
import { cashCloses } from './cash.schema';

/** Either laptop closes the day; only the admin corrects it or reopens the day. */
export const cashClosesSync: SyncEntry = {
  name: 'cashCloses',
  table: cashCloses,
  schema: cashCloseRecordSchema as unknown as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: cashierCreatesOnly,
};
