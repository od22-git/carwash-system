import type { OpenTicketStatus, TicketRecord } from '@carwash/shared';
import { formatDuration, formatTime } from '../../../../shared/lib/time-format';
import { PlateChip } from '../../../../shared/ui';
import { useWash } from '../../hooks/wash-context';
import { GraceTimer } from './GraceTimer';
import { TicketActions } from './TicketActions';

const STRIPE: Record<OpenTicketStatus, string> = {
  waiting: 'border-s-status-waiting',
  washing: 'border-s-status-washing',
  grace: 'border-s-status-grace',
};

export function TicketCard({ ticket, now }: { ticket: TicketRecord; now: number }) {
  const { workerName } = useWash();
  const status = ticket.status as OpenTicketStatus;

  return (
    <article
      aria-label={`سيارة ${ticket.plate}`}
      className={`flex flex-col gap-3 rounded-xl border border-s-4 border-line bg-surface p-4 ${STRIPE[status]}`}
    >
      <header className="flex items-start justify-between gap-2">
        <PlateChip plate={ticket.plate} size="lg" />
        <span className="text-sm text-muted">{ticket.receiptNo}</span>
      </header>
      <div>
        <p className="font-semibold">{ticket.customerName}</p>
        <p className="text-sm text-muted">
          العامل: {workerName(ticket.workerId)}
          {ticket.requestedWorker && ' (بطلب الزبون)'}
        </p>
      </div>
      <p className="text-sm">{ticket.lines.map((line) => line.name).join('، ')}</p>
      {status === 'grace' ? (
        <GraceTimer ticket={ticket} now={now} />
      ) : (
        <p className="text-sm text-muted">
          دخلت {formatTime(ticket.arrivedAt)}، منذ {formatDuration(now - ticket.arrivedAt)}
        </p>
      )}
      <TicketActions ticket={ticket} now={now} />
    </article>
  );
}
