import { formatSYP, type ParkingSessionRecord } from '@carwash/shared';
import { formatDate, formatDuration, formatTime } from '../../../../shared/lib/time-format';
import { Receipt, ReceiptRow, ReceiptSection } from '../../../../shared/ui';
import { planLabel } from '../../lib/describe';

interface ParkingReceiptProps {
  session: ParkingSessionRecord;
  shopName: string;
  footer: string;
}

/** Given when the car enters (fee still open) and again when it leaves (with the fee). */
export function ParkingReceipt({ session, shopName, footer }: ParkingReceiptProps) {
  const { leftAt, coveredUntil } = session;
  return (
    <Receipt
      shopName={shopName}
      footer={footer}
      receiptNo={session.receiptNo}
      at={session.enteredAt}
      atLabel="وقت الدخول"
      plate={session.plate}
      cancelled={session.status === 'cancelled'}
      total={leftAt === null ? 'يُحسب عند الخروج' : formatSYP(session.fee)}
    >
      <ReceiptRow label="العميل" value={session.customerName} />
      <ReceiptRow label="الكراج" value={planLabel(session.planName, session.plan)} />
      {coveredUntil !== null && (
        <ReceiptRow label="مشمول بالباقة حتى" value={formatDate(coveredUntil)} />
      )}
      {leftAt !== null && (
        <ReceiptSection>
          <ReceiptRow label="وقت الخروج" value={`${formatDate(leftAt)} ${formatTime(leftAt)}`} />
          <ReceiptRow label="المدة" value={formatDuration(leftAt - session.enteredAt)} />
          {session.billedHours > 0 && (
            <ReceiptRow label="ساعات محسوبة" value={String(session.billedHours)} />
          )}
        </ReceiptSection>
      )}
    </Receipt>
  );
}
