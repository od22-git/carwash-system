import { OPEN_TICKET_STATUSES, TICKET_STATUS_LABELS, type TicketRecord } from '@carwash/shared';
import { TicketCard } from './TicketCard';

const EMPTY: Record<(typeof OPEN_TICKET_STATUSES)[number], string> = {
  waiting: 'لا توجد سيارات بانتظار عامل.',
  washing: 'لا توجد سيارات قيد الغسيل.',
  grace: 'لا توجد سيارات بانتظار الاستلام.',
};

/** Three columns in wash order: waiting, washing, waiting for pickup. */
export function WashBoard({ tickets, now }: { tickets: TicketRecord[]; now: number }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {OPEN_TICKET_STATUSES.map((status) => {
        const column = tickets.filter((t) => t.status === status);
        return (
          <section
            key={status}
            aria-label={TICKET_STATUS_LABELS[status]}
            className="flex flex-col gap-3"
          >
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              {TICKET_STATUS_LABELS[status]}
              <span className="rounded-full bg-ink/10 px-2.5 text-sm">{column.length}</span>
            </h2>
            {column.length === 0 && <p className="text-sm text-muted">{EMPTY[status]}</p>}
            {column.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} now={now} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
