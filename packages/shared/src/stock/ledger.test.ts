import { describe, expect, it } from 'vitest';
import { averageUnitCost, buildLedger, levelAt, periodSummary } from '.';

const move = (type: 'purchase' | 'count' | 'damage', at: number, qty: number, value: number) => ({
  productId: 'p',
  type,
  at,
  qty,
  value,
  counted: type === 'count' ? 10 : null,
  deletedAt: null,
});

const sale = (soldAt: number, units: number, status: 'paid' | 'cancelled' = 'paid') => ({
  soldAt,
  status,
  deletedAt: null,
  lines: [
    {
      productId: 'p',
      name: 'x',
      kind: 'stock' as const,
      mode: 'piece' as const,
      quantity: units,
      units,
      unitPrice: 5000,
      total: units * 5000,
    },
  ],
});

const movements = [
  move('purchase', 10, 24, 240_000),
  move('purchase', 20, 12, 144_000),
  move('damage', 30, -1, -10_000),
  { ...move('purchase', 40, 100, 1), deletedAt: 41 },
];
const sales = [sale(25, 5), sale(35, 2, 'cancelled')];
const entries = buildLedger(movements, sales).get('p')!;

describe('buildLedger', () => {
  it('orders entries and leaves out deleted movements and cancelled sales', () => {
    expect(entries.map((e) => e.type)).toEqual(['purchase', 'purchase', 'sale', 'damage']);
  });
});

describe('levelAt', () => {
  it('sums everything before the moment', () => {
    expect(levelAt(entries)).toBe(30);
    expect(levelAt(entries, 25)).toBe(36);
  });
});

describe('averageUnitCost', () => {
  it('uses purchases only, and is 0 before any', () => {
    expect(averageUnitCost(entries)).toBeCloseTo(10_666.67, 1);
    expect(averageUnitCost(entries, 5)).toBe(0);
  });
});

describe('periodSummary', () => {
  it('nothing lost reads as 0, never -0', () => {
    const s = periodSummary(entries, 0, 15);
    expect(Object.is(s.countLossValue, -0)).toBe(false);
    expect(Object.is(s.sold, -0)).toBe(false);
  });

  it('opening + purchased - sold - damaged = closing', () => {
    const s = periodSummary(entries, 15, 100);
    expect(s).toMatchObject({
      opening: 24,
      purchased: 12,
      purchaseCost: 144_000,
      sold: 5,
      revenue: 25_000,
      damaged: 1,
      damagedValue: 10_000,
      closing: 30,
      lastCounted: null,
    });
  });

  it('a count records the waste and the units found', () => {
    const counted = buildLedger([...movements, move('count', 50, -4, -40_000)], []).get('p')!;
    expect(periodSummary(counted, 45, 60)).toMatchObject({
      countLoss: 4,
      countLossValue: 40_000,
      lastCounted: 10,
    });
  });
});
