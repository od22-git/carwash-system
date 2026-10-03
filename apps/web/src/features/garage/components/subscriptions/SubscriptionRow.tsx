import { useState } from 'react';
import { formatDate } from '../../../../shared/lib/time-format';
import { Button, CancelReceiptForm } from '../../../../shared/ui';
import { useGarage } from '../../hooks/garage-context';
import type { VehicleSubscription } from '../../hooks/use-subscriptions';
import { cancelSubscription } from '../../lib/subscription-actions';
import { PrintSubscriptionButton } from '../receipts/PrintButtons';

export const SUBSCRIPTION_HEADERS = [
  'الإيصال',
  'اللوحة',
  'العميل',
  'الباقة',
  'حتى',
  'غسلات باقية',
  'الكراج',
  '',
];

/** A running package. The admin can cancel it (logged). */
export function SubscriptionRow({ entry }: { entry: VehicleSubscription }) {
  const { isAdmin, user } = useGarage();
  const [cancelling, setCancelling] = useState(false);
  const { subscription: sub, washesLeft } = entry;

  return (
    <>
      <tr className="border-b border-line last:border-0">
        <td className="px-3 py-2">{sub.receiptNo}</td>
        <td className="px-3 py-2" dir="ltr">
          <span className="block text-right">{sub.plate}</span>
        </td>
        <td className="px-3 py-2">{sub.customerName}</td>
        <td className="px-3 py-2">{sub.packageName}</td>
        <td className="px-3 py-2 tabular-nums">{formatDate(sub.endsAt)}</td>
        <td className="px-3 py-2 tabular-nums">
          {sub.freeWashes > 0 ? `${washesLeft} من ${sub.freeWashes}` : '—'}
        </td>
        <td className="px-3 py-2">{sub.includesParking ? 'مشمول' : '—'}</td>
        <td className="flex flex-wrap gap-1 px-3 py-1">
          <PrintSubscriptionButton sub={sub} />
          {isAdmin && !cancelling && (
            <Button variant="quiet" onClick={() => setCancelling(true)}>
              إلغاء الباقة
            </Button>
          )}
        </td>
      </tr>
      {cancelling && (
        <tr>
          <td colSpan={SUBSCRIPTION_HEADERS.length} className="px-3 py-2">
            <CancelReceiptForm
              onConfirm={(reason) => cancelSubscription(sub, reason, user)}
              onDone={() => setCancelling(false)}
            />
          </td>
        </tr>
      )}
    </>
  );
}
