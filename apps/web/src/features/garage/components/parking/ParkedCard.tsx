import { formatSYP, parkingCharge, type ParkingSessionRecord } from '@carwash/shared';
import { useState } from 'react';
import { formatDate, formatDuration, formatWhen } from '../../../../shared/lib/time-format';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, CancelReceiptForm, Notice, PlateChip } from '../../../../shared/ui';
import { PayLaterToggle } from '../../../debts';
import { useGarage } from '../../hooks/garage-context';
import { planLabel } from '../../lib/describe';
import { cancelParking, releaseCar } from '../../lib/parking-actions';
import { PrintParkingButton } from '../receipts/PrintButtons';

/** A car in the garage: how long it has been here and what it would pay now. */
export function ParkedCard({ session, now }: { session: ParkingSessionRecord; now: number }) {
  const { garage, isAdmin, user } = useGarage();
  const [cancelling, setCancelling] = useState(false);
  const [paidLater, setPaidLater] = useState(false);
  const action = useAction();
  const fee = parkingCharge(session, now, garage).fee;

  return (
    <article
      aria-label={`سيارة ${session.plate}`}
      className="flex flex-col gap-3 rounded-xl border border-s-4 border-line border-s-foam bg-surface p-4"
    >
      <header className="flex items-start justify-between gap-2">
        <PlateChip plate={session.plate} size="lg" />
        <span className="text-sm text-muted">{session.receiptNo}</span>
      </header>
      <div>
        <p className="font-semibold">{session.customerName}</p>
        <p className="text-sm text-muted">
          {planLabel(session.planName, session.plan)}
          {session.coveredUntil !== null &&
            `، مشمول بالباقة حتى ${formatDate(session.coveredUntil)}`}
        </p>
      </div>
      <p className="text-sm text-muted">
        دخلت {formatWhen(session.enteredAt, now)}، منذ {formatDuration(now - session.enteredAt)}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={action.busy}
          onClick={() => void action.run(() => releaseCar(session, garage, paidLater))}
        >
          خروج السيارة ({formatSYP(fee)})
        </Button>
        {fee > 0 && <PayLaterToggle checked={paidLater} onChange={setPaidLater} />}
        <PrintParkingButton session={session} />
        {isAdmin && !cancelling && (
          <Button variant="quiet" onClick={() => setCancelling(true)}>
            إلغاء الإيصال
          </Button>
        )}
      </div>
      {cancelling && (
        <CancelReceiptForm
          onConfirm={(reason) => cancelParking(session, reason, user)}
          onDone={() => setCancelling(false)}
        />
      )}
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </article>
  );
}
