import {
  expensesByLine,
  revenueBySource,
  type ExpenseLine,
  type ExpenseRecord,
  type ExpensesByLine,
  type RevenueBySource,
} from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, inRange } from '../../../core/db';
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
    const range = monthRange(month);
    const [from, to] = range;
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
      inRange(db.tickets, 'deliveredAt', range),
      inRange(db.parkingSessions, 'leftAt', range),
      inRange(db.subscriptions, 'createdAt', range),
      inRange(db.sales, 'soldAt', range),
      inRange(db.workerPayments, 'at', range),
      inRange(db.stockMovements, 'at', range),
      inRange(db.expenses, 'at', range),
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
