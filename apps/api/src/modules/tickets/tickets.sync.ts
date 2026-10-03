import { ticketRecordSchema } from '@carwash/shared';
import type { SyncEntry } from '../sync';
import { authorizeTicketChange } from './ticket-rules';
import { tickets } from './tickets.schema';

export const ticketsSync: SyncEntry = {
  name: 'tickets',
  table: tickets,
  schema: ticketRecordSchema as SyncEntry['schema'],
  pushRoles: ['admin', 'user'],
  pullRoles: ['admin', 'user'],
  authorize: authorizeTicketChange,
};
