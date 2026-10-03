import type { SYP } from '../common';

export interface DailyWasteResult {
  consumed: number;
  cost: SYP;
  /** The evening count is higher than expected: a counting or entry mistake to check. */
  countAboveExpected: boolean;
}

/** Waste of one wash material for a day: opening + bought today - counted this evening. */
export function dailyWaste(
  opening: number,
  boughtToday: number,
  counted: number,
  unitCost: number,
): DailyWasteResult {
  const consumed = opening + boughtToday - counted;
  if (consumed < 0) return { consumed: 0, cost: 0, countAboveExpected: true };
  return { consumed, cost: Math.round(consumed * unitCost), countAboveExpected: false };
}
