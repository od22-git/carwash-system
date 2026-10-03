import { auditEventRecordSchema } from '@carwash/shared';
import { appendOnly, type SyncEntry } from '../sync';
import { auditEvents } from './audit.schema';

/** Both laptops write events; only the owner reads them. */
export const auditSync: SyncEntry = {
  name: 'auditEvents',
  table: auditEvents,
  schema: auditEventRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin'],
  authorize: appendOnly,
};
