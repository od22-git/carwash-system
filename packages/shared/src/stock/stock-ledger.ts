import type { SYP } from '../common';

export const MOVEMENT_TYPES = ['purchase', 'sale', 'waste', 'damage', 'adjust'] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

/**
 * One line of the stock ledger. Stock is never edited in place, only added to,
 * so two laptops syncing later can never overwrite each other.
 * Quantities are single units; positive = in, negative = out.
 */
export interface StockMovement {
  type: MovementType;
  qty: number;
  /** Total cost for purchases; 0 for other movements. */
  cost: SYP;
}

export function stockLevel(movements: StockMovement[]): number {
  return movements.reduce((sum, m) => sum + m.qty, 0);
}

/** Average cost of one unit, from all purchases. 0 when nothing was bought yet. */
export function averageUnitCost(movements: StockMovement[]): number {
  let qty = 0;
  let cost = 0;
  for (const m of movements) {
    if (m.type !== 'purchase' || m.qty <= 0) continue;
    qty += m.qty;
    cost += m.cost;
  }
  return qty === 0 ? 0 : cost / qty;
}
