import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { fromDateInput, toDateInput } from '../../../shared/lib/date-input';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice, SelectField } from '../../../shared/ui';
import { recordExpense } from '../lib/finance-actions';

const OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: EXPENSE_CATEGORY_LABELS[c] }));

/** A running cost: rent, electricity, internet, ... (wages and stock are counted on their own). */
export function ExpenseForm({ onDone }: { onDone: () => void }) {
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState(() => toDateInput(Date.now()));
  const [note, setNote] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = { category, amount: parseWholeNumber(amount), note };
    if (await action.run(() => recordExpense({ ...input, at: fromDateInput(day, Date.now()) }))) {
      onDone();
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <SelectField
        label="البند"
        options={OPTIONS}
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
      />
      <Field
        label="المبلغ (ل.س)"
        ltr
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Field label="التاريخ" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      <Field label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex flex-col gap-3 sm:col-span-2">
        {action.error && <Notice tone="error">{action.error}</Notice>}
        <div className="flex gap-2">
          <Button type="submit" disabled={action.busy}>
            إضافة المصروف
          </Button>
          <Button variant="secondary" onClick={onDone}>
            تراجع
          </Button>
        </div>
      </div>
    </form>
  );
}
