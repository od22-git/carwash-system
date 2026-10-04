import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_LINE_LABELS,
  EXPENSE_LINES,
  REVENUE_SOURCE_LABELS,
  REVENUE_SOURCES,
  totalOf,
  type DebtBalance,
} from '@carwash/shared';
import type { SheetSpec } from '../../../shared/lib/excel';
import { formatDate, formatMonth } from '../../../shared/lib/time-format';
import type { MonthFinance } from '../hooks/use-month-finance';

const amount = (header: string) => ({ header, money: true });

/** The finance screen of one month as a workbook: summary, income, budget, costs, debts. */
export function financeSheets(
  month: string,
  finance: MonthFinance,
  debtors: DebtBalance[],
): SheetSpec[] {
  const title = `الحسابات: ${formatMonth(month)}`;
  const income = totalOf(finance.revenue);
  const spent = totalOf(finance.expenses);
  const budgeted = totalOf(finance.budgets as Record<string, number>);
  return [
    {
      name: 'الملخص',
      title,
      columns: [{ header: 'البند' }, amount('المبلغ')],
      rows: [
        ['الدخل', income],
        ['المصاريف', spent],
        ['الصافي', income - spent],
      ],
    },
    {
      name: 'الدخل',
      title,
      columns: [{ header: 'المصدر' }, amount('المبلغ')],
      rows: REVENUE_SOURCES.map((s) => [REVENUE_SOURCE_LABELS[s], finance.revenue[s]]),
      totals: ['المجموع', income],
    },
    {
      name: 'المصاريف والميزانية',
      title,
      columns: [
        { header: 'البند' },
        amount('الميزانية'),
        amount('المصروف فعلاً'),
        amount('المتبقي'),
      ],
      rows: EXPENSE_LINES.map((line) => {
        const budget = finance.budgets[line] ?? 0;
        const used = finance.expenses[line];
        return [EXPENSE_LINE_LABELS[line], budget || null, used, budget ? budget - used : null];
      }),
      totals: ['المجموع', budgeted, spent, null],
    },
    {
      name: 'مصاريف أخرى',
      title,
      columns: [{ header: 'التاريخ' }, { header: 'البند' }, amount('المبلغ'), { header: 'ملاحظة' }],
      rows: finance.expenseRows.map((e) => [
        formatDate(e.at),
        EXPENSE_CATEGORY_LABELS[e.category],
        e.amount,
        e.note,
      ]),
    },
    {
      name: 'ديون العملاء',
      title: 'ديون العملاء (آجل)',
      columns: [{ header: 'العميل' }, amount('على الحساب'), amount('المدفوع'), amount('المستحق')],
      rows: debtors.map((d) => [d.customerName, d.owed, d.paid, d.balance]),
      totals: ['المجموع', null, null, debtors.reduce((s, d) => s + d.balance, 0)],
    },
  ];
}
