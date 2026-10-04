import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { deleteExpense, recordExpense, saveBudget } from './finance-actions';

const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };

describe('finance actions', () => {
  beforeEach(freshLaptop);

  it('records a running cost, and a deletion is logged', async () => {
    const bill = await recordExpense({ category: 'internet', amount: 150_000, at: 1, note: ' ' });
    expect(bill).toMatchObject({ category: 'internet', note: '' });
    await deleteExpense(bill, owner);
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({ action: 'expense.delete', summary: 'إنترنت (150,000 ل.س)' });
  });

  it('refuses a cost without an amount', async () => {
    await expect(recordExpense({ category: 'rent', amount: 0, at: 1, note: '' })).rejects.toThrow(
      'اكتب المبلغ.',
    );
  });

  it('one budget row per month and line, typed with commas; empty means 0', async () => {
    await saveBudget('2026-10', 'rent', '1,000,000');
    await saveBudget('2026-10', 'rent', '1,200,000');
    await saveBudget('2026-10', 'wages', '');
    const rows = await db.budgets.toArray();
    expect(rows.map((b) => [b.id, b.amount])).toEqual([
      ['2026-10:rent', 1_200_000],
      ['2026-10:wages', 0],
    ]);
    expect(() => saveBudget('2026-10', 'rent', 'abc')).toThrow('اكتب المبلغ بالأرقام.');
  });
});
