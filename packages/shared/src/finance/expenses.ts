import type { SYP } from '../common';
import type { StockMovementRecord } from '../stock';
import type { WorkerPaymentRecord } from '../workers';
import { EXPENSE_LINES, type ExpenseLine } from './budget-record';
import type { ExpenseRecord } from './expense-record';

export interface ExpensesInput {
  workerPayments: Pick<WorkerPaymentRecord, 'amount' | 'at' | 'deletedAt'>[];
  stockMovements: Pick<StockMovementRecord, 'type' | 'value' | 'at' | 'deletedAt'>[];
  expenses: Pick<ExpenseRecord, 'category' | 'amount' | 'at' | 'deletedAt'>[];
}

export type ExpensesByLine = Record<ExpenseLine, SYP>;

/**
 * Money going out in [from, to): wages and advances given, stock bought (wash materials
 * included, so their waste is not counted twice), and the running costs.
 */
export function expensesByLine(input: ExpensesInput, from: number, to: number): ExpensesByLine {
  const inside = (row: { at: number; deletedAt: number | null }) =>
    !row.deletedAt && row.at >= from && row.at < to;
  const e = Object.fromEntries(EXPENSE_LINES.map((line) => [line, 0])) as ExpensesByLine;
  for (const p of input.workerPayments) {
    if (inside(p)) e.wages += p.amount;
  }
  for (const m of input.stockMovements) {
    if (inside(m) && m.type === 'purchase') e.purchases += m.value;
  }
  for (const x of input.expenses) {
    if (inside(x)) e[x.category] += x.amount;
  }
  return e;
}
