import type { TicketRecord } from '@carwash/shared';
import { printNode } from '../../../../core/print';
import { Button } from '../../../../shared/ui';
import { useWash } from '../../hooks/wash-context';
import { TicketReceipt } from './TicketReceipt';

export function PrintReceiptButton({ ticket }: { ticket: TicketRecord }) {
  const { receipt, workerName } = useWash();
  const print = () =>
    printNode(
      <TicketReceipt
        ticket={ticket}
        shopName={receipt.shopName}
        footer={receipt.footer}
        workerName={workerName(ticket.workerId)}
      />,
    );
  return (
    <Button variant="quiet" onClick={print}>
      طباعة الإيصال
    </Button>
  );
}
