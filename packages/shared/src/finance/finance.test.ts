import { describe, expect, it } from 'vitest';
import { budgetId, budgetRecordSchema, expensesByLine, revenueBySource, totalOf } from '.';

const live = { deletedAt: null };
const line = (kind: 'stock' | 'buffet', total: number) => ({
  productId: 'p',
  name: 'x',
  kind,
  mode: 'piece' as const,
  quantity: 1,
  units: 1,
  unitPrice: total,
  total,
});

describe('revenueBySource', () => {
  const input = {
    tickets: [
      {
        ...live,
        status: 'delivered' as const,
        deliveredAt: 15,
        washTotal: 45_000,
        garageFee: 10_000,
      },
      { ...live, status: 'delivered' as const, deliveredAt: 99, washTotal: 1, garageFee: 0 },
      { ...live, status: 'cancelled' as const, deliveredAt: 15, washTotal: 1, garageFee: 0 },
      { ...live, status: 'grace' as const, deliveredAt: null, washTotal: 1, garageFee: 0 },
    ],
    parkingSessions: [
      { ...live, status: 'left' as const, leftAt: 12, fee: 20_000 },
      { ...live, status: 'parked' as const, leftAt: null, fee: 0 },
    ],
    subscriptions: [
      { ...live, status: 'active' as const, createdAt: 11, price: 500_000 },
      { ...live, status: 'cancelled' as const, createdAt: 11, price: 1 },
    ],
    sales: [
      {
        ...live,
        status: 'paid' as const,
        soldAt: 13,
        lines: [line('stock', 60_000), line('buffet', 3_000)],
      },
      { deletedAt: 14, status: 'paid' as const, soldAt: 13, lines: [line('buffet', 1)] },
    ],
  };

  it('counts each receipt in its source, once earned, cancelled and deleted left out', () => {
    const r = revenueBySource(input, 10, 20);
    expect(r).toEqual({
      wash: 45_000,
      garage: 30_000,
      packages: 500_000,
      stock: 60_000,
      buffet: 3_000,
    });
    expect(totalOf(r)).toBe(638_000);
  });
});

describe('expensesByLine', () => {
  it('wages given, stock bought and running costs; counts and damage are not spending', () => {
    const e = expensesByLine(
      {
        workerPayments: [{ ...live, amount: 20_000, at: 12 }],
        stockMovements: [
          { ...live, type: 'purchase', value: 100_000, at: 12 },
          { ...live, type: 'count', value: -30_000, at: 12 },
          { ...live, type: 'purchase', value: 9, at: 30 },
        ],
        expenses: [
          { ...live, category: 'internet', amount: 150_000, at: 11 },
          { deletedAt: 1, category: 'rent', amount: 9, at: 11 },
        ],
      },
      10,
      20,
    );
    expect(e).toMatchObject({ wages: 20_000, purchases: 100_000, internet: 150_000, rent: 0 });
  });
});

describe('budgetRecordSchema', () => {
  const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };
  it('one row per month and line', () => {
    const ok = {
      ...base,
      id: budgetId('2026-10', 'rent'),
      month: '2026-10',
      line: 'rent',
      amount: 1,
    };
    expect(budgetRecordSchema.safeParse(ok).success).toBe(true);
    expect(budgetRecordSchema.safeParse({ ...ok, id: 'other' }).success).toBe(false);
    expect(budgetRecordSchema.safeParse({ ...ok, month: '2026-13' }).success).toBe(false);
  });
});
