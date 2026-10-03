import { auditEventRecordSchema } from '@carwash/shared';
import type { SyncEntry, WireRow } from '../sync';
import { auditEvents } from './audit.schema';

/** An event, once on the server, can never be rewritten (not even by the admin). */
const appendOnly = (_incoming: WireRow, _user: unknown, existing: WireRow | undefined) =>
  existing ? 'append_only' : null;

/** Both laptops write events; only the owner reads them. */
export const auditSync: SyncEntry = {
  name: 'auditEvents',
  table: auditEvents,
  schema: auditEventRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin'],
  authorize: appendOnly,
};
