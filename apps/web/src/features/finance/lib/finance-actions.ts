import {
  budgetId,
  EXPENSE_CATEGORY_LABELS,
  formatSYP,
  type ExpenseCategory,
  type ExpenseLine,
  type ExpenseRecord,
  type SessionUser,
} from '@carwash/shared';
import { logAudit } from '../../../core/audit';
import { deleteRecord, saveRecord } from '../../../core/sync';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { UserError } from '../../../shared/lib/user-error';

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  at: number;
  note: string;
}

export async function recordExpense(input: ExpenseInput): Promise<ExpenseRecord> {
  if (!(input.amount > 0)) throw new UserError('اكتب المبلغ.');
  const row = { ...input, note: input.note.trim() };
  return (await saveRecord('expenses', row)) as ExpenseRecord;
}

/** Removes a wrong entry, logged. */
export async function deleteExpense(expense: ExpenseRecord, user: SessionUser) {
  await deleteRecord('expenses', expense.id);
  await logAudit({
    action: 'expense.delete',
    user,
    targetId: expense.id,
    summary: `${EXPENSE_CATEGORY_LABELS[expense.category]} (${formatSYP(expense.amount)})`,
    reason: '',
  });
}

/** The planned amount for one line of one month ("" clears it to 0). */
export function saveBudget(month: string, line: ExpenseLine, typed: string) {
  const amount = typed.trim() === '' ? 0 : parseWholeNumber(typed);
  if (Number.isNaN(amount)) throw new UserError('اكتب المبلغ بالأرقام.');
  return saveRecord('budgets', { id: budgetId(month, line), month, line, amount });
}
