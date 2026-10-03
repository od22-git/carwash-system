import { describe, expect, it } from 'vitest';
import {
  averageUnitCost,
  dailyWaste,
  isSellable,
  splitUnits,
  stockLevel,
  toUnits,
  type StockMovement,
} from '.';

const ledger: StockMovement[] = [
  { type: 'purchase', qty: 24, cost: 240_000 },
  { type: 'purchase', qty: 12, cost: 144_000 },
  { type: 'sale', qty: -5, cost: 0 },
  { type: 'damage', qty: -1, cost: 0 },
];

describe('stock ledger', () => {
  it('level is the sum of all movements', () => expect(stockLevel(ledger)).toBe(30));
  it('average unit cost uses purchases only', () =>
    expect(averageUnitCost(ledger)).toBe(10_666.666666666666));
  it('average cost is 0 before any purchase', () => expect(averageUnitCost([])).toBe(0));
});

describe('units', () => {
  it('converts cartons to units and back', () => {
    expect(toUnits(3, 5, 12)).toBe(41);
    expect(splitUnits(41, 12)).toEqual({ cartons: 3, pieces: 5 });
    expect(splitUnits(7, 1)).toEqual({ cartons: 0, pieces: 7 });
  });
});

describe('dailyWaste', () => {
  it('consumed = opening + bought - counted', () => {
    expect(dailyWaste(20, 10, 22, 5_000)).toEqual({
      consumed: 8,
      cost: 40_000,
      countAboveExpected: false,
    });
  });

  it('flags a count higher than expected', () => {
    expect(dailyWaste(5, 0, 7, 5_000).countAboveExpected).toBe(true);
  });
});

describe('isSellable', () => {
  it('wash materials are never for sale', () => {
    expect(isSellable('consumable')).toBe(false);
    expect(isSellable('buffet')).toBe(true);
  });
});
