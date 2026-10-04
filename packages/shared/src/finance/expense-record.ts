import { z } from 'zod';
import { syncRecordBase } from '../contracts/sync';

/** Running costs the admin records by hand (wages and purchases are counted on their own). */
export const EXPENSE_CATEGORIES = [
  'rent',
  'electricity',
  'water',
  'internet',
  'maintenance',
  'other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'إيجار',
  electricity: 'كهرباء',
  water: 'مياه',
  internet: 'إنترنت',
  maintenance: 'صيانة',
  other: 'أخرى',
};

export const expenseRecordSchema = syncRecordBase.extend({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().int().positive(),
  at: z.number().int(),
  note: z.string().trim().max(200).default(''),
});
export type ExpenseRecord = z.infer<typeof expenseRecordSchema>;
