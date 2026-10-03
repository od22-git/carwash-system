import type { PackageRecord, ParkingPlanRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

/** The admin's fixed-period parking plans (paying by the hour is always offered too). */
export function useParkingPlans(): { plans: ParkingPlanRecord[]; loading: boolean } {
  const rows = useActiveRows(() => db.parkingPlans.toArray());
  return { plans: [...(rows ?? [])].sort(bySortOrder), loading: rows === undefined };
}

export function usePackages(): { packages: PackageRecord[]; loading: boolean } {
  const rows = useActiveRows(() => db.packages.toArray());
  return { packages: [...(rows ?? [])].sort(bySortOrder), loading: rows === undefined };
}
