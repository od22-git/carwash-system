import type { SYP } from '../common';
import type { CarSize } from './car-size';

/** priceMatrix[serviceId][carSize] = price. A missing price means "not offered for this size yet". */
export type PriceMatrix = Record<string, Partial<Record<CarSize, SYP>>>;

export interface WashPriceResult {
  total: SYP;
  lines: { serviceId: string; price: SYP }[];
  /** Services without a price for this size. The UI blocks saving while this is not empty. */
  missing: string[];
}

/** The wash price is the sum of every selected service, priced for the car's size. */
export function washPrice(
  serviceIds: string[],
  size: CarSize,
  matrix: PriceMatrix,
): WashPriceResult {
  const lines: WashPriceResult['lines'] = [];
  const missing: string[] = [];
  for (const id of new Set(serviceIds)) {
    const price = matrix[id]?.[size];
    if (price === undefined) missing.push(id);
    else lines.push({ serviceId: id, price });
  }
  return { total: lines.reduce((sum, l) => sum + l.price, 0), lines, missing };
}
