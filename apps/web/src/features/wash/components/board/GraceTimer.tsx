import { deliveryTotals, formatSYP, graceRemainingMs, type TicketRecord } from '@carwash/shared';
import { formatCountdown } from '../../../../shared/lib/time-format';
import { useWash } from '../../hooks/wash-context';

/** Pickup countdown after the WhatsApp notice; once over, the garage fee so far. */
export function GraceTimer({ ticket, now }: { ticket: TicketRecord; now: number }) {
  const { garage } = useWash();
  const remaining = graceRemainingMs(ticket.notifiedAt ?? now, now, garage);

  if (remaining > 0) {
    return (
      <p className="font-semibold tabular-nums text-status-grace">
        مهلة الاستلام: {formatCountdown(remaining)}
      </p>
    );
  }
  const { garageFee } = deliveryTotals(ticket, now, garage);
  return (
    <p className="rounded-md bg-status-grace/10 px-3 py-1.5 font-semibold text-status-grace">
      انتهت المهلة. رسوم الكراج حتى الآن {formatSYP(garageFee)}
    </p>
  );
}
