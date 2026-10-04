import { describe, expect, it } from 'vitest';
import { debtBalances, owedReceipts, type DebtInput } from '.';

const receipt = (id: string, customerId: string, extra: object) => ({
  id,
  customerId,
  customerName: customerId,
  receiptNo: `A-${id}`,
  plate: 'حلب 1',
  deletedAt: null,
  ...extra,
});

const input: DebtInput = {
  tickets: [
    receipt('1', 'sami', { status: 'delivered', paidLater: true, total: 45_000, deliveredAt: 10 }),
    receipt('2', 'sami', { status: 'delivered', paidLater: false, total: 30_000, deliveredAt: 11 }),
    receipt('3', 'sami', { status: 'cancelled', paidLater: true, total: 99_000, deliveredAt: 12 }),
    receipt('4', 'rana', { status: 'delivered', paidLater: true, total: 20_000, deliveredAt: 13 }),
  ] as DebtInput['tickets'],
  parkingSessions: [
    receipt('5', 'sami', { status: 'left', paidLater: true, fee: 10_000, leftAt: 14 }),
    receipt('6', 'sami', { status: 'parked', paidLater: false, fee: 0, leftAt: null }),
  ] as DebtInput['parkingSessions'],
  payments: [
    { customerId: 'sami', customerName: 'sami', amount: 25_000, deletedAt: null },
    { customerId: 'sami', customerName: 'sami', amount: 999, deletedAt: 5 },
  ],
};

describe('owedReceipts', () => {
  it('only valid receipts taken on credit, newest first; cancelling clears the debt', () => {
    expect(owedReceipts(input).map((r) => [r.receiptNo, r.kind, r.amount])).toEqual([
      ['A-5', 'garage', 10_000],
      ['A-4', 'wash', 20_000],
      ['A-1', 'wash', 45_000],
    ]);
  });
});

describe('debtBalances', () => {
  it('owed minus paid per customer, largest debt first', () => {
    expect(debtBalances(input)).toEqual([
      { customerId: 'sami', customerName: 'sami', owed: 55_000, paid: 25_000, balance: 30_000 },
      { customerId: 'rana', customerName: 'rana', owed: 20_000, paid: 0, balance: 20_000 },
    ]);
  });
});
