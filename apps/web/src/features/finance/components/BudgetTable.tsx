import {
  EXPENSE_LINE_LABELS,
  EXPENSE_LINES,
  formatSYP,
  totalOf,
  type ExpenseLine,
  type ExpensesByLine,
} from '@carwash/shared';
import { useAction } from '../../../shared/lib/use-action';
import { CommitInput, Notice, Table } from '../../../shared/ui';
import { saveBudget } from '../lib/finance-actions';

interface BudgetTableProps {
  month: string;
  expenses: ExpensesByLine;
  budgets: Partial<Record<ExpenseLine, number>>;
}

/** Each line's planned budget (typed in place) against what was really spent. */
export function BudgetTable({ month, expenses, budgets }: BudgetTableProps) {
  const action = useAction();
  const left = (line: ExpenseLine) => {
    const budget = budgets[line] ?? 0;
    return budget > 0 ? budget - expenses[line] : null;
  };

  return (
    <div className="flex flex-col gap-3">
      <Table headers={['البند', 'الميزانية', 'المصروف فعلاً', 'المتبقي']} minWidth="34rem">
        {EXPENSE_LINES.map((line) => {
          const rest = left(line);
          return (
            <tr key={line} className="border-b border-line">
              <td className="px-3 py-2 font-semibold">{EXPENSE_LINE_LABELS[line]}</td>
              <td className="w-44 px-2 py-1">
                <CommitInput
                  aria-label={`ميزانية ${EXPENSE_LINE_LABELS[line]}`}
                  ltr
                  inputMode="numeric"
                  placeholder="—"
                  value={budgets[line] ? budgets[line].toLocaleString('en-US') : ''}
                  onCommit={(typed) => void action.run(() => saveBudget(month, line, typed))}
                />
              </td>
              <td className="px-3 py-2 tabular-nums">{formatSYP(expenses[line])}</td>
              <td
                className={`px-3 py-2 tabular-nums ${rest !== null && rest < 0 ? 'font-semibold text-status-grace' : ''}`}
              >
                {rest === null ? '—' : rest < 0 ? `تجاوز ${formatSYP(-rest)}` : formatSYP(rest)}
              </td>
            </tr>
          );
        })}
        <tr className="bg-ground font-semibold">
          <td className="px-3 py-2">المجموع</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(totalOf(budgets))}</td>
          <td className="px-3 py-2 tabular-nums">{formatSYP(totalOf(expenses))}</td>
          <td />
        </tr>
      </Table>
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </div>
  );
}
