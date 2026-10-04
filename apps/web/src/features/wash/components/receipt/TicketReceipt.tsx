import { CAR_SIZE_LABELS, formatSYP, type TicketRecord } from '@carwash/shared';
import { Receipt, ReceiptRow, ReceiptSection } from '../../../../shared/ui';

interface TicketReceiptProps {
  ticket: TicketRecord;
  shopName: string;
  footer: string;
  workerName: string;
}

/** The wash receipt: customer, entry time, services, total. */
export function TicketReceipt({ ticket, shopName, footer, workerName }: TicketReceiptProps) {
  return (
    <Receipt
      shopName={shopName}
      footer={footer}
      receiptNo={ticket.receiptNo}
      at={ticket.arrivedAt}
      atLabel="وقت الدخول"
      plate={ticket.plate}
      cancelled={ticket.status === 'cancelled'}
      paidLater={ticket.paidLater}
      total={formatSYP(ticket.total)}
    >
      <ReceiptRow label="العميل" value={ticket.customerName} />
      <ReceiptRow label="السيارة" value={CAR_SIZE_LABELS[ticket.size]} />
      <ReceiptRow label="العامل" value={workerName} />
      <ReceiptSection>
        {ticket.lines.map((line) => (
          <ReceiptRow key={line.serviceId} label={line.name} value={formatSYP(line.price)} />
        ))}
        {ticket.packageDiscount > 0 && (
          <ReceiptRow label="خصم الباقة (غسلة مجانية)" value={formatSYP(ticket.packageDiscount)} />
        )}
        {ticket.garageFee > 0 && (
          <ReceiptRow
            label={`الكراج (${ticket.garageHours} ساعة)`}
            value={formatSYP(ticket.garageFee)}
          />
        )}
      </ReceiptSection>
    </Receipt>
  );
}
