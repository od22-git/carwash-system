import type { TicketRecord } from '@carwash/shared';

type OpenTicket = Pick<TicketRecord, 'workerId' | 'status' | 'arrivedAt'>;

/** Workers washing a car right now. */
export function busyWorkerIds(open: OpenTicket[]): Set<string> {
  return new Set(open.filter((t) => t.status === 'washing').map((t) => t.workerId));
}

/** How many cars are waiting for each worker. */
export function waitingCounts(open: OpenTicket[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of open) {
    if (t.status === 'waiting') counts.set(t.workerId, (counts.get(t.workerId) ?? 0) + 1);
  }
  return counts;
}
