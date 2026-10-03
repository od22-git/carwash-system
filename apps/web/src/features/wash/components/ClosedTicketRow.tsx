import { formatSYP, TICKET_STATUS_LABELS, type TicketRecord } from '@carwash/shared';
import { useState } from 'react';
import { formatTime } from '../../../shared/lib/time-format';
import { Button, CancelReceiptForm } from '../../../shared/ui';
import { useWash } from '../hooks/wash-context';
import { cancelTicket } from '../lib/ticket-actions';
import { PrintReceiptButton } from './receipt/PrintReceiptButton';

const COLUMNS = 7;

/** One closed receipt. The admin can still cancel a delivered one (it is logged). */
export function ClosedTicketRow({ ticket }: { ticket: TicketRecord }) {
  const { workerName, isAdmin, user } = useWash();
  const [cancelling, setCancelling] = useState(false);
  const cancelled = ticket.status === 'cancelled';

  return (
    <>
      <tr className={`border-b border-line last:border-0 ${cancelled ? 'text-muted' : ''}`}>
        <td className="px-3 py-2">{ticket.receiptNo}</td>
        <td className="px-3 py-2" dir="ltr">
          <span className="block text-right">{ticket.plate}</span>
        </td>
        <td className="px-3 py-2">{ticket.customerName}</td>
        <td className="px-3 py-2">{workerName(ticket.workerId)}</td>
        <td className="px-3 py-2 tabular-nums">
          {formatTime(ticket.deliveredAt ?? ticket.cancelledAt ?? ticket.updatedAt)}
        </td>
        <td className="px-3 py-2 tabular-nums">
          {cancelled ? TICKET_STATUS_LABELS.cancelled : formatSYP(ticket.total)}
        </td>
        <td className="flex flex-wrap gap-1 px-3 py-1">
          <PrintReceiptButton ticket={ticket} />
          {isAdmin && !cancelled && !cancelling && (
            <Button variant="quiet" onClick={() => setCancelling(true)}>
              إلغاء الإيصال
            </Button>
          )}
        </td>
      </tr>
      {cancelling && (
        <tr>
          <td colSpan={COLUMNS} className="px-3 py-2">
            <CancelReceiptForm
              onConfirm={(reason) => cancelTicket(ticket, reason, user)}
              onDone={() => setCancelling(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}
