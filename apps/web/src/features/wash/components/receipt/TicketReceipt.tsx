import { CAR_SIZE_LABELS, formatSYP, type TicketRecord } from '@carwash/shared';
import { formatDate, formatTime } from '../../../../shared/lib/time-format';

interface TicketReceiptProps {
  ticket: TicketRecord;
  shopName: string;
  footer: string;
  workerName: string;
}

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div className={`flex justify-between gap-2 ${strong ? 'text-[13pt] font-bold' : ''}`}>
    <span>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

/** The printed receipt (80 mm). Black on white, large plate and total. */
export function TicketReceipt({ ticket, shopName, footer, workerName }: TicketReceiptProps) {
  return (
    <div dir="rtl" className="flex flex-col gap-2 px-1 font-body text-[10pt] leading-snug">
      <p className="text-center text-[14pt] font-bold">{shopName}</p>
      <div className="border-y border-dashed border-black py-1.5">
        <Row label="رقم الإيصال" value={ticket.receiptNo} />
        <Row label="التاريخ" value={formatDate(ticket.arrivedAt)} />
        <Row label="وقت الدخول" value={formatTime(ticket.arrivedAt)} />
      </div>
      <p className="text-center text-[16pt] font-bold" dir="ltr">
        {ticket.plate}
      </p>
      <Row label="العميل" value={ticket.customerName} />
      <Row label="السيارة" value={CAR_SIZE_LABELS[ticket.size]} />
      <Row label="العامل" value={workerName} />
      <div className="border-t border-dashed border-black pt-1.5">
        {ticket.lines.map((line) => (
          <Row key={line.serviceId} label={line.name} value={formatSYP(line.price)} />
        ))}
        {ticket.garageFee > 0 && (
          <Row label={`الكراج (${ticket.garageHours} ساعة)`} value={formatSYP(ticket.garageFee)} />
        )}
      </div>
      <div className="border-t border-black pt-1.5">
        <Row label="المجموع" value={formatSYP(ticket.total)} strong />
      </div>
      {ticket.status === 'cancelled' && <p className="text-center font-bold">إيصال ملغى</p>}
      {footer && <p className="mt-2 text-center">{footer}</p>}
    </div>
  );
}
