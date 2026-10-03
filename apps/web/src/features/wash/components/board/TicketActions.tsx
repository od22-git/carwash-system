import { deliveryTotals, formatSYP, type TicketRecord } from '@carwash/shared';
import { useState } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Notice } from '../../../../shared/ui';
import { useWash } from '../../hooks/wash-context';
import { deliver, markNotified, startWashing } from '../../lib/ticket-actions';
import { PrintReceiptButton } from '../receipt/PrintReceiptButton';
import { CancelTicketForm } from './CancelTicketForm';
import { NotifyCustomer } from './NotifyCustomer';

/** Only the next sensible steps for the car's status. */
export function TicketActions({ ticket, now }: { ticket: TicketRecord; now: number }) {
  const { garage, isAdmin } = useWash();
  const [cancelling, setCancelling] = useState(false);
  const action = useAction();
  const run = (fn: () => Promise<unknown>) => void action.run(fn);
  const toPay = deliveryTotals(ticket, now, garage).total;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {ticket.status === 'waiting' && (
          <Button disabled={action.busy} onClick={() => run(() => startWashing(ticket))}>
            بدء الغسيل
          </Button>
        )}
        {ticket.status === 'washing' && (
          <>
            <NotifyCustomer ticket={ticket} onNotified={() => run(() => markNotified(ticket))} />
            <Button variant="quiet" onClick={() => run(() => deliver(ticket, garage))}>
              الزبون استلم مباشرة
            </Button>
          </>
        )}
        {ticket.status === 'grace' && (
          <Button disabled={action.busy} onClick={() => run(() => deliver(ticket, garage))}>
            تسليم السيارة ({formatSYP(toPay)})
          </Button>
        )}
        <PrintReceiptButton ticket={ticket} />
        {isAdmin && !cancelling && (
          <Button variant="quiet" onClick={() => setCancelling(true)}>
            إلغاء الإيصال
          </Button>
        )}
      </div>
      {cancelling && <CancelTicketForm ticket={ticket} onDone={() => setCancelling(false)} />}
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </div>
  );
}
