import {
  currentSubscription,
  washesLeft,
  type SubscriptionRecord,
  type TicketRecord,
} from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, useActiveRows } from '../../../core/db';

export interface VehicleSubscription {
  subscription: SubscriptionRecord;
  washesLeft: number;
}

const countsFreeWash = (t: TicketRecord) => !t.deletedAt && t.status !== 'cancelled';

/** Free washes already taken from each of these packages (both laptops' tickets). */
async function washesUsed(ids: string[]): Promise<Map<string, number>> {
  const tickets = await db.tickets.where('subscriptionId').anyOf(ids).toArray();
  const used = new Map<string, number>();
  for (const t of tickets.filter(countsFreeWash)) {
    used.set(t.subscriptionId!, (used.get(t.subscriptionId!) ?? 0) + 1);
  }
  return used;
}

/** The package the car is using right now, with its free washes left. `null` = none. */
export function useVehicleSubscription(vehicleId: string, at: number) {
  return useLiveQuery(async (): Promise<VehicleSubscription | null> => {
    const subs = await db.subscriptions.where('vehicleId').equals(vehicleId).toArray();
    const current = currentSubscription(subs, vehicleId, at);
    if (!current) return null;
    const used = (await washesUsed([current.id])).get(current.id) ?? 0;
    return { subscription: current, washesLeft: washesLeft(current, used) };
  }, [vehicleId, at]);
}

/** Packages not ended or cancelled (including renewals that start later), ending soonest first. */
export function useRunningSubscriptions(now: number): VehicleSubscription[] | undefined {
  return useLiveQuery(async () => {
    const subs = (await db.subscriptions.toArray()).filter(
      (s) => !s.deletedAt && s.status === 'active' && s.endsAt > now,
    );
    const used = await washesUsed(subs.map((s) => s.id));
    return subs
      .sort((a, b) => a.endsAt - b.endsAt)
      .map((s) => ({ subscription: s, washesLeft: washesLeft(s, used.get(s.id) ?? 0) }));
  }, [now]);
}

/** Every package sold for one car (to start a renewal after the current one). */
export function useCarSubscriptions(vehicleId: string): SubscriptionRecord[] | undefined {
  return useActiveRows(
    () => db.subscriptions.where('vehicleId').equals(vehicleId).toArray(),
    [vehicleId],
  );
}

/** Packages sold since `from` (cancelled ones included, marked). */
export function useSubscriptionsSoldSince(from: number): SubscriptionRecord[] | undefined {
  return useActiveRows(
    () => db.subscriptions.where('createdAt').aboveOrEqual(from).toArray(),
    [from],
  );
}
