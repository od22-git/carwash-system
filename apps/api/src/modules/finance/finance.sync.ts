import { budgetRecordSchema, expenseRecordSchema } from '@carwash/shared';
import type { SyncEntry } from '../sync';
import { budgets, expenses } from './finance.schema';

/** The shop's money in and out is the owner's business: admin only, both ways. */
const adminOnly = { pushRoles: ['admin'], pullRoles: ['admin'] } satisfies Partial<SyncEntry>;

export const expensesSync: SyncEntry = {
  name: 'expenses',
  table: expenses,
  schema: expenseRecordSchema as unknown as SyncEntry['schema'],
  ...adminOnly,
};

export const budgetsSync: SyncEntry = {
  name: 'budgets',
  table: budgets,
  schema: budgetRecordSchema as unknown as SyncEntry['schema'],
  ...adminOnly,
};
