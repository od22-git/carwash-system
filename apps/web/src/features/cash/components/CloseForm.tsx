import { cashDifference, formatSYP } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useSessionUser } from '../../../core/auth';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { closeCash } from '../lib/cash-actions';
import { DifferenceText } from './difference';

interface CloseFormProps {
  day: string;
  expected: number;
  lastFloat: number;
}

const orZero = (text: string) => parseWholeNumber(text) || 0;

/** The cashier counts the drawer at the end of the day and closes it. */
export function CloseForm({ day, expected, lastFloat }: CloseFormProps) {
  const user = useSessionUser();
  const [float, setFloat] = useState(lastFloat ? lastFloat.toLocaleString('en-US') : '');
  const [paidOut, setPaidOut] = useState('');
  const [counted, setCounted] = useState('');
  const [note, setNote] = useState('');
  const action = useAction();
  const shouldHave = orZero(float) + expected - orZero(paidOut);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    await action.run(() => closeCash({ day, expected, float, paidOut, counted, note }, user));
  }

  return (
    <form onSubmit={submit} aria-label="عدّ الصندوق" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="الفكة أول اليوم (ل.س)"
          ltr
          inputMode="numeric"
          value={float}
          onChange={(e) => setFloat(e.target.value)}
        />
        <Field
          label="مدفوع من الصندوق اليوم (ل.س)"
          hint="فواتير أو أجور دُفعت نقداً من الصندوق (اختياري)."
          ltr
          inputMode="numeric"
          value={paidOut}
          onChange={(e) => setPaidOut(e.target.value)}
        />
        <Field
          label="المبلغ الموجود في الصندوق (ل.س)"
          hint="كل النقود في الصندوق مع الفكة."
          ltr
          inputMode="numeric"
          value={counted}
          onChange={(e) => setCounted(e.target.value)}
        />
      </div>
      <Field label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
      <p className="flex flex-wrap gap-x-6 gap-y-1">
        <span>
          يجب أن يكون في الصندوق <strong className="tabular-nums">{formatSYP(shouldHave)}</strong>
        </span>
        {counted.trim() !== '' && (
          <span>
            الفرق{' '}
            <DifferenceText
              value={cashDifference({
                expected,
                float: orZero(float),
                paidOut: orZero(paidOut),
                counted: orZero(counted),
              })}
            />
          </span>
        )}
      </p>
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        إغلاق الصندوق
      </Button>
    </form>
  );
}
