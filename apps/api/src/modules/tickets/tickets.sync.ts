import { ticketRecordSchema } from '@carwash/shared';
import { receiptRules, type SyncEntry } from '../sync';
import { tickets } from './tickets.schema';

export const ticketsSync: SyncEntry = {
  name: 'tickets',
  table: tickets,
  schema: ticketRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: receiptRules(['delivered', 'cancelled']),
};
