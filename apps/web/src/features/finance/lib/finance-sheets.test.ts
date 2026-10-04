import { describe, expect, it } from 'vitest';
import type { MonthFinance } from '../hooks/use-month-finance';
import { financeSheets } from './finance-sheets';

const finance = {
  revenue: { wash: 900_000, garage: 100_000, packages: 0, stock: 50_000, buffet: 0 },
  expenses: {
    wages: 300_000,
    purchases: 0,
    rent: 0,
    electricity: 0,
    water: 0,
    internet: 150_000,
    maintenance: 0,
    other: 0,
  },
  budgets: { internet: 100_000 },
  expenseRows: [],
} as unknown as MonthFinance;
const debtors = [
  { customerId: 'c', customerName: 'خالد', owed: 45_000, paid: 20_000, balance: 25_000 },
];

describe('finance workbook', () => {
  it('summary, income, budget (over budget is negative), costs and debts', () => {
    const [summary, income, budget, , debts] = financeSheets('2026-10', finance, debtors);
    expect(summary!.rows).toEqual([
      ['الدخل', 1_050_000],
      ['المصاريف', 450_000],
      ['الصافي', 600_000],
    ]);
    expect(income!.totals).toEqual(['المجموع', 1_050_000]);
    expect(budget!.rows.find((r) => r[0] === 'إنترنت')).toEqual([
      'إنترنت',
      100_000,
      150_000,
      -50_000,
    ]);
    expect(budget!.rows.find((r) => r[0] === 'أجور العمال')).toEqual([
      'أجور العمال',
      null,
      300_000,
      null,
    ]);
    expect(debts!.totals).toEqual(['المجموع', null, null, 25_000]);
  });
});
