import type { ParkingSessionRecord, SessionUser, SubscriptionRecord } from '@carwash/shared';
import { closedAt } from '../../hooks/use-parking-sessions';
import { cancelParking } from '../../lib/parking-actions';
import { cancelSubscription } from '../../lib/subscription-actions';
import { PrintParkingButton, PrintSubscriptionButton } from '../receipts/PrintButtons';
import type { TodayEntry } from './TodayRow';

export function parkingEntry(s: ParkingSessionRecord, user: SessionUser): TodayEntry {
  return {
    id: s.id,
    receiptNo: s.receiptNo,
    kind: `كراج: ${s.planName}`,
    plate: s.plate,
    customerName: s.customerName,
    at: closedAt(s),
    amount: s.fee,
    cancelled: s.status === 'cancelled',
    paidLater: s.paidLater,
    printButton: <PrintParkingButton session={s} />,
    cancel: (reason) => cancelParking(s, reason, user),
  };
}

export function subscriptionEntry(s: SubscriptionRecord, user: SessionUser): TodayEntry {
  return {
    id: s.id,
    receiptNo: s.receiptNo,
    kind: `باقة: ${s.packageName}`,
    plate: s.plate,
    customerName: s.customerName,
    at: s.createdAt,
    amount: s.price,
    cancelled: s.status === 'cancelled',
    printButton: <PrintSubscriptionButton sub={s} />,
    cancel: (reason) => cancelSubscription(s, reason, user),
  };
}
