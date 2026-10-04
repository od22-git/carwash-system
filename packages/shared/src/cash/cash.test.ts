import { describe, expect, it } from 'vitest';
import { cashCloseRecordSchema, cashDifference, cashIn, type CashInput } from '.';

const sold = (kind: 'stock' | 'buffet', total: number, soldAt = 5, status = 'paid') => ({
  status,
  soldAt,
  deletedAt: null,
  lines: [{ kind, total }],
});

const input = {
  tickets: [
    { status: 'delivered', deliveredAt: 5, washTotal: 45_000, garageFee: 10_000, paidLater: false },
    { status: 'delivered', deliveredAt: 6, washTotal: 30_000, garageFee: 0, paidLater: true },
    { status: 'cancelled', deliveredAt: 7, washTotal: 99_000, garageFee: 0, paidLater: false },
    { status: 'delivered', deliveredAt: 50, washTotal: 20_000, garageFee: 0, paidLater: false },
  ],
  parkingSessions: [
    { status: 'left', leftAt: 5, fee: 20_000, paidLater: false },
    { status: 'left', leftAt: 6, fee: 15_000, paidLater: true },
  ],
  subscriptions: [{ status: 'active', createdAt: 5, price: 500_000 }],
  sales: [sold('stock', 40_000), sold('buffet', 5_000), sold('buffet', 9_000, 5, 'cancelled')],
  debtPayments: [
    { amount: 25_000, at: 8, deletedAt: null },
    { amount: 7_000, at: 8, deletedAt: 9 },
  ],
} as unknown as CashInput;

describe('cash in the drawer', () => {
  it('counts the day’s receipts paid now, and debts paid; credit is left out', () => {
    expect(cashIn(input, 0, 10)).toEqual({
      wash: 45_000,
      garage: 30_000,
      packages: 500_000,
      sales: 45_000,
      debtPayments: 25_000,
      total: 645_000,
      onAccount: 45_000,
    });
  });

  it('the difference: counted against float + cash in − cash taken out', () => {
    const close = { expected: 645_000, float: 50_000, paidOut: 100_000 };
    expect(cashDifference({ ...close, counted: 595_000 })).toBe(0);
    expect(cashDifference({ ...close, counted: 590_000 })).toBe(-5_000);
    expect(cashDifference({ ...close, counted: 600_000 })).toBe(5_000);
  });

  it('one close per day: the id is the day', () => {
    const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };
    const close = { expected: 0, float: 0, paidOut: 0, counted: 0, closedBy: 'x', at: 1 };
    const ok = { ...base, ...close, id: '2026-10-04', day: '2026-10-04' };
    expect(cashCloseRecordSchema.safeParse(ok).success).toBe(true);
    expect(cashCloseRecordSchema.safeParse({ ...ok, id: 'other' }).success).toBe(false);
  });
});
