import { packageWashDiscount, type TicketLine } from '@carwash/shared';
import type { VehicleSubscription } from '../../garage';

/** How the car's package changes this wash. */
export interface PackageUse {
  /** Set when a free wash is taken from the package. */
  subscriptionId: string | null;
  packageDiscount: number;
  /** The package covers the garage until then (no late-pickup fee before it). */
  coveredUntil: number | null;
}

export const NO_PACKAGE: PackageUse = {
  subscriptionId: null,
  packageDiscount: 0,
  coveredUntil: null,
};

export function packageUse(
  current: VehicleSubscription | null,
  lines: TicketLine[],
  useFreeWash: boolean,
): PackageUse {
  if (!current) return NO_PACKAGE;
  const { subscription, washesLeft } = current;
  const coveredUntil = subscription.includesParking ? subscription.endsAt : null;
  const discount =
    useFreeWash && washesLeft > 0 ? packageWashDiscount(lines, subscription.washServiceIds) : 0;
  return {
    subscriptionId: discount > 0 ? subscription.id : null,
    packageDiscount: discount,
    coveredUntil,
  };
}
