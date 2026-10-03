import { formatSYP } from '@carwash/shared';
import { useState, type ReactNode } from 'react';
import { formatTime } from '../../../../shared/lib/time-format';
import { Button, CancelReceiptForm } from '../../../../shared/ui';
import { useGarage } from '../../hooks/garage-context';

/** One of today's garage or package receipts, in the shape the table shows. */
export interface TodayEntry {
  id: string;
  receiptNo: string;
  /** "كراج: يوم" or "باقة: شهري". */
  kind: string;
  plate: string;
  customerName: string;
  at: number;
  amount: number;
  cancelled: boolean;
  printButton: ReactNode;
  cancel: (reason: string) => Promise<unknown>;
}

export const TODAY_HEADERS = ['الإيصال', 'النوع', 'اللوحة', 'العميل', 'الوقت', 'المبلغ', ''];

export function TodayRow({ entry }: { entry: TodayEntry }) {
  const { isAdmin } = useGarage();
  const [cancelling, setCancelling] = useState(false);

  return (
    <>
      <tr className={`border-b border-line last:border-0 ${entry.cancelled ? 'text-muted' : ''}`}>
        <td className="px-3 py-2">{entry.receiptNo}</td>
        <td className="px-3 py-2">{entry.kind}</td>
        <td className="px-3 py-2" dir="ltr">
          <span className="block text-right">{entry.plate}</span>
        </td>
        <td className="px-3 py-2">{entry.customerName}</td>
        <td className="px-3 py-2 tabular-nums">{formatTime(entry.at)}</td>
        <td className="px-3 py-2 tabular-nums">
          {entry.cancelled ? 'ملغى' : formatSYP(entry.amount)}
        </td>
        <td className="flex flex-wrap gap-1 px-3 py-1">
          {entry.printButton}
          {isAdmin && !entry.cancelled && !cancelling && (
            <Button variant="quiet" onClick={() => setCancelling(true)}>
              إلغاء الإيصال
            </Button>
          )}
        </td>
      </tr>
      {cancelling && (
        <tr>
          <td colSpan={TODAY_HEADERS.length} className="px-3 py-2">
            <CancelReceiptForm onConfirm={entry.cancel} onDone={() => setCancelling(false)} />
          </td>
        </tr>
      )}
    </>
  );
}
