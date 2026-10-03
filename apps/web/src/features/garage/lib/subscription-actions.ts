import {
  formatSYP,
  subscriptionEnd,
  type CustomerRecord,
  type PackageRecord,
  type SessionUser,
  type SubscriptionRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { nextReceiptNo } from '../../../core/db';
import { saveRecord } from '../../../core/sync';

export interface PackageSale {
  customer: CustomerRecord;
  vehicle: VehicleRecord;
  pkg: PackageRecord;
  /** Now, or when the car's current package ends (a renewal). */
  startsAt: number;
}

/** Sells a package for one car. Its terms are copied, so later edits do not change it. */
export async function sellPackage({ customer, vehicle, pkg, startsAt }: PackageSale) {
  const row = {
    receiptNo: await nextReceiptNo(),
    customerId: customer.id,
    vehicleId: vehicle.id,
    customerName: customer.name,
    plate: vehicle.plate,
    packageId: pkg.id,
    packageName: pkg.name,
    price: pkg.price,
    freeWashes: pkg.freeWashes,
    washServiceIds: pkg.washServiceIds,
    includesParking: pkg.includesParking,
    startsAt,
    endsAt: subscriptionEnd(startsAt, pkg.durationDays),
    status: 'active',
  };
  return (await saveRecord('subscriptions', row)) as SubscriptionRecord;
}

/** Admin only. The receipt stays (marked cancelled) and the action is logged. */
export async function cancelSubscription(
  sub: SubscriptionRecord,
  reason: string,
  user: SessionUser,
) {
  const changes = { status: 'cancelled', cancelledAt: Date.now(), cancelReason: reason.trim() };
  const cancelled = await saveRecord('subscriptions', { id: sub.id, ...changes });
  await logAudit({
    action: 'subscription.cancel',
    user,
    targetId: sub.id,
    summary: `${sub.receiptNo} ${sub.plate} ${sub.packageName} (${formatSYP(sub.price)})`,
    reason,
  });
  return cancelled as SubscriptionRecord;
}
