import type { ParkingSessionRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

/** Cars in the garage now, the longest-staying first. */
export function useParkedCars(): ParkingSessionRecord[] | undefined {
  const rows = useActiveRows(() => db.parkingSessions.where('status').equals('parked').toArray());
  return rows?.sort((a, b) => a.enteredAt - b.enteredAt);
}

export const closedAt = (s: ParkingSessionRecord) => s.leftAt ?? s.cancelledAt ?? s.updatedAt;

/** Garage receipts closed (car left, or cancelled) since `from`. */
export function useParkingClosedSince(from: number): ParkingSessionRecord[] | undefined {
  const rows = useActiveRows(
    () => db.parkingSessions.where('status').anyOf(['left', 'cancelled']).toArray(),
    [from],
  );
  return rows?.filter((s) => closedAt(s) >= from);
}
