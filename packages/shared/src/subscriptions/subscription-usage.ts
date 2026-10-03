import { DAY_MS, type SYP } from '../common';
import type { TicketLine } from '../tickets/ticket-record';
import type { SubscriptionRecord } from './subscription-record';

type Sub = Pick<
  SubscriptionRecord,
  'vehicleId' | 'status' | 'startsAt' | 'endsAt' | 'deletedAt' | 'freeWashes'
>;

export const subscriptionEnd = (startsAt: number, durationDays: number) =>
  startsAt + durationDays * DAY_MS;

export const isSubscriptionActive = (sub: Sub, at: number) =>
  sub.status === 'active' && sub.deletedAt === null && at >= sub.startsAt && at < sub.endsAt;

/** The car's package in use now: of the active ones, the one that ends first. */
export function currentSubscription<T extends Sub>(subs: T[], vehicleId: string, at: number) {
  return subs
    .filter((s) => s.vehicleId === vehicleId && isSubscriptionActive(s, at))
    .sort((a, b) => a.endsAt - b.endsAt)[0];
}

/** A new package starts now, or when the car's current packages end (a renewal). */
export function nextSubscriptionStart(subs: Sub[], vehicleId: string, now: number): number {
  const ends = subs
    .filter((s) => s.vehicleId === vehicleId && s.status === 'active' && s.deletedAt === null)
    .map((s) => s.endsAt);
  return Math.max(now, ...ends);
}

export const washesLeft = (sub: Pick<Sub, 'freeWashes'>, used: number) =>
  Math.max(0, sub.freeWashes - used);

/** What a free wash takes off this visit: the price of the services the package covers. */
export function packageWashDiscount(
  lines: Pick<TicketLine, 'serviceId' | 'price'>[],
  washServiceIds: string[],
): SYP {
  const covered = new Set(washServiceIds);
  return lines.filter((l) => covered.has(l.serviceId)).reduce((sum, l) => sum + l.price, 0);
}
