import { cashDifference, formatSYP, type CashCloseRecord } from '@carwash/shared';
import { useSessionUser } from '../../../core/auth';
import { formatDate, formatTime } from '../../../shared/lib/time-format';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Notice } from '../../../shared/ui';
import { reopenCash } from '../lib/cash-actions';
import { PrintCashCloseButton } from './CashCloseReceipt';
import { DifferenceText } from './difference';

interface ClosedCardProps {
  close: CashCloseRecord;
  /** Cash in from the receipts now: differs if a receipt changed after closing. */
  expectedNow: number;
}

/** A closed day: the count, the difference, and (admin) reopen. */
export function ClosedCard({ close, expectedNow }: ClosedCardProps) {
  const user = useSessionUser();
  const action = useAction();
  const rows = [
    ['الفكة أول اليوم', formatSYP(close.float)],
    ['دخل الصندوق', formatSYP(close.expected)],
    ['مدفوع من الصندوق', formatSYP(close.paidOut)],
    ['المبلغ المعدود', formatSYP(close.counted)],
  ];

  return (
    <article
      aria-label="الصندوق مغلق"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5"
    >
      <p className="font-semibold">
        أُغلق الصندوق: {close.closedBy}، {formatDate(close.at)} {formatTime(close.at)}
      </p>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-sm text-muted">الفرق</dt>
          <dd>
            <DifferenceText value={cashDifference(close)} />
          </dd>
        </div>
      </dl>
      {close.note && <p className="text-sm">ملاحظة: {close.note}</p>}
      {expectedNow !== close.expected && (
        <Notice tone="warning">
          تغيّرت إيصالات هذا اليوم بعد الإغلاق: دخل الصندوق الآن {formatSYP(expectedNow)}.
        </Notice>
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <PrintCashCloseButton close={close} />
        {user?.role === 'admin' && (
          <Button
            variant="quiet"
            disabled={action.busy}
            onClick={() => void action.run(() => reopenCash(close, user))}
          >
            إعادة فتح اليوم
          </Button>
        )}
      </div>
    </article>
  );
}
