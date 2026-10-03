import type { ReactNode } from 'react';
import { formatDate, formatTime } from '../../lib/time-format';
import { ReceiptRow } from './ReceiptRow';

interface ReceiptProps {
  shopName: string;
  footer: string;
  receiptNo: string;
  /** Shown as date + time, e.g. the car's entry. */
  at: number;
  atLabel: string;
  plate: string;
  cancelled: boolean;
  /** The receipt's own rows: customer, services, fees. */
  children: ReactNode;
  total: string;
}

/** A printed receipt (80 mm): black on white, large plate and total. */
export function Receipt(props: ReceiptProps) {
  return (
    <div dir="rtl" className="flex flex-col gap-2 px-1 font-body text-[10pt] leading-snug">
      <p className="text-center text-[14pt] font-bold">{props.shopName}</p>
      <div className="border-y border-dashed border-black py-1.5">
        <ReceiptRow label="رقم الإيصال" value={props.receiptNo} />
        <ReceiptRow label="التاريخ" value={formatDate(props.at)} />
        <ReceiptRow label={props.atLabel} value={formatTime(props.at)} />
      </div>
      <p className="text-center text-[16pt] font-bold" dir="ltr">
        {props.plate}
      </p>
      {props.children}
      <div className="border-t border-black pt-1.5">
        <ReceiptRow label="المجموع" value={props.total} strong />
      </div>
      {props.cancelled && <p className="text-center font-bold">إيصال ملغى</p>}
      {props.footer && <p className="mt-2 text-center">{props.footer}</p>}
    </div>
  );
}

/** A dashed block inside the receipt (e.g. the priced lines). */
export function ReceiptSection({ children }: { children: ReactNode }) {
  return <div className="border-t border-dashed border-black pt-1.5">{children}</div>;
}
