import { deliveryTotals, formatSYP, type TicketRecord } from '@carwash/shared';
import { useState } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, CancelReceiptForm, Notice } from '../../../../shared/ui';
import { PayLaterToggle } from '../../../debts';
import { useWash } from '../../hooks/wash-context';
import { cancelTicket, deliver, markNotified, startWashing } from '../../lib/ticket-actions';
import { PrintReceiptButton } from '../receipt/PrintReceiptButton';
import { NotifyCustomer } from './NotifyCustomer';

/** Only the next sensible steps for the car's status. */
export function TicketActions({ ticket, now }: { ticket: TicketRecord; now: number }) {
  const { garage, isAdmin, user } = useWash();
  const [cancelling, setCancelling] = useState(false);
  const [paidLater, setPaidLater] = useState(false);
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
            <Button variant="quiet" onClick={() => run(() => deliver(ticket, garage, paidLater))}>
              الزبون استلم مباشرة
            </Button>
            <PayLaterToggle checked={paidLater} onChange={setPaidLater} />
          </>
        )}
        {ticket.status === 'grace' && (
          <>
            <Button
              disabled={action.busy}
              onClick={() => run(() => deliver(ticket, garage, paidLater))}
            >
              تسليم السيارة ({formatSYP(toPay)})
            </Button>
            <PayLaterToggle checked={paidLater} onChange={setPaidLater} />
          </>
        )}
        <PrintReceiptButton ticket={ticket} />
        {isAdmin && !cancelling && (
          <Button variant="quiet" onClick={() => setCancelling(true)}>
            إلغاء الإيصال
          </Button>
        )}
      </div>
      {cancelling && (
        <CancelReceiptForm
          onConfirm={(reason) => cancelTicket(ticket, reason, user)}
          onDone={() => setCancelling(false)}
        />
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </div>
  );
}
