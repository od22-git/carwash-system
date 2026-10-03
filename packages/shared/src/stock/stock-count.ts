import type { SYP } from '../common';

export interface CountResult {
  /** counted − expected: the movement to record (negative = units gone). */
  diff: number;
  /** Units used up or lost since the last count (0 when the count is higher). */
  consumed: number;
  /** Money value of the diff at the average cost, same sign as diff. */
  value: SYP;
  /** More found than expected: a counting or entry mistake to check. */
  aboveExpected: boolean;
}

/**
 * The evening count of a product. For wash materials, what is missing is the day's waste:
 * expected (opening + bought) − counted.
 */
export function countResult(expected: number, counted: number, unitCost: number): CountResult {
  const diff = counted - expected;
  return {
    diff,
    consumed: Math.max(0, -diff),
    value: Math.round(diff * unitCost),
    aboveExpected: diff > 0,
  };
}

export type StockStatus = 'out' | 'low' | 'ok';

/** Out at 0 or below; low at or under the admin's minimum. */
export function stockStatus(level: number, minQty: number): StockStatus {
  if (level <= 0) return 'out';
  return level <= minQty ? 'low' : 'ok';
}

/** Waste cost per washed car, or null on a day without cars. */
export const costPerCar = (cost: SYP, cars: number): SYP | null =>
  cars > 0 ? Math.round(cost / cars) : null;
