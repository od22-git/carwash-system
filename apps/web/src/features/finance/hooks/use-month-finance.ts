import {
  expensesByLine,
  revenueBySource,
  type ExpenseLine,
  type ExpenseRecord,
  type ExpensesByLine,
  type RevenueBySource,
} from '@carwash/shared';
import type { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';
import { monthRange } from '../../../shared/lib/date-input';

export interface MonthFinance {
  revenue: RevenueBySource;
  expenses: ExpensesByLine;
  budgets: Partial<Record<ExpenseLine, number>>;
  /** The running costs entered this month, newest first. */
  expenseRows: ExpenseRecord[];
}

/** Everything the finance screen shows for one month ("2026-10"). Admin laptop only. */
export function useMonthFinance(month: string): MonthFinance | undefined {
  return useLiveQuery(async () => {
    const [from, to] = monthRange(month);
    const inMonth = <T, I>(table: Table<T, string, I>, index: string) =>
      table.where(index).between(from, to, true, false).toArray();
    const [
      tickets,
      parkingSessions,
      subscriptions,
      sales,
      workerPayments,
      stockMovements,
      expenses,
      budgets,
    ] = await Promise.all([
      inMonth(db.tickets, 'deliveredAt'),
      inMonth(db.parkingSessions, 'leftAt'),
      inMonth(db.subscriptions, 'createdAt'),
      inMonth(db.sales, 'soldAt'),
      inMonth(db.workerPayments, 'at'),
      inMonth(db.stockMovements, 'at'),
      inMonth(db.expenses, 'at'),
      db.budgets.where('month').equals(month).toArray(),
    ]);
    return {
      revenue: revenueBySource({ tickets, parkingSessions, subscriptions, sales }, from, to),
      expenses: expensesByLine({ workerPayments, stockMovements, expenses }, from, to),
      budgets: Object.fromEntries(
        budgets.filter((b) => !b.deletedAt).map((b) => [b.line, b.amount]),
      ),
      expenseRows: expenses.filter((e) => !e.deletedAt).sort((a, b) => b.at - a.at),
    };
  }, [month]);
}
