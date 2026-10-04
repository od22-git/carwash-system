import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from './expense-record';

/** Every kind of money going out in a month: wages, stock purchases, running costs. */
export const EXPENSE_LINES = ['wages', 'purchases', ...EXPENSE_CATEGORIES] as const;
export type ExpenseLine = (typeof EXPENSE_LINES)[number];

export const EXPENSE_LINE_LABELS: Record<ExpenseLine, string> = {
  wages: 'أجور العمال',
  purchases: 'مشتريات المخزون',
  ...EXPENSE_CATEGORY_LABELS,
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "2026-10:rent": one budget per month and line, so both laptops edit the same row. */
export const budgetId = (month: string, line: ExpenseLine) => `${month}:${line}`;

/** What the admin plans to spend on one line in one month. */
export const budgetRecordSchema = syncRecordBase
  .extend({
    month: z.string().regex(MONTH),
    line: z.enum(EXPENSE_LINES),
    amount: z.number().int().nonnegative(),
  })
  .refine((b) => b.id === budgetId(b.month, b.line), {
    message: 'Budget id must be "<month>:<line>"',
    path: ['id'],
  });
export type BudgetRecord = z.infer<typeof budgetRecordSchema>;
