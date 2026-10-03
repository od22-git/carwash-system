import { OPEN_TICKET_STATUSES, type TicketRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

const byArrival = (a: TicketRecord, b: TicketRecord) => a.arrivedAt - b.arrivedAt;

/** Cars on the board: waiting, washing, or in the pickup grace period. */
export function useOpenTickets(): TicketRecord[] | undefined {
  const rows = useActiveRows(() =>
    db.tickets
      .where('status')
      .anyOf([...OPEN_TICKET_STATUSES])
      .toArray(),
  );
  return rows?.sort(byArrival);
}

/** Tickets closed (delivered or cancelled) since `from`, newest first. */
export function useClosedTicketsSince(from: number): TicketRecord[] | undefined {
  const rows = useActiveRows(
    () => db.tickets.where('status').anyOf(['delivered', 'cancelled']).toArray(),
    [from],
  );
  const closedAt = (t: TicketRecord) => t.deliveredAt ?? t.cancelledAt ?? t.updatedAt;
  return rows?.filter((t) => closedAt(t) >= from).sort((a, b) => closedAt(b) - closedAt(a));
}
