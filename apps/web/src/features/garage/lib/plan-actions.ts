import type { ParkingPlanRecord } from '@carwash/shared';
import { saveRecord } from '../../../core/sync';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { nextSortOrder } from '../../../shared/lib/sort-order';

export interface PlanInput {
  name: string;
  /** As typed: "24", "٤٨". */
  hours: string;
  price: string;
  active: boolean;
}

/** Adds a plan (no id) or edits one. A paused plan is no longer offered for new cars. */
export async function savePlan(input: PlanInput, existing: ParkingPlanRecord[], id?: string) {
  const row = {
    id,
    name: input.name.trim(),
    durationHours: parseWholeNumber(input.hours),
    price: parseWholeNumber(input.price),
    active: input.active,
    ...(id ? {} : { sortOrder: nextSortOrder(existing) }),
  };
  return (await saveRecord('parkingPlans', row)) as ParkingPlanRecord;
}
