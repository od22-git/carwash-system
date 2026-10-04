import type { DebtPaymentRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { useAction } from '../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../shared/ui';
import { recordDebtPayment } from '../lib/debt-actions';

interface DebtPaymentFormProps {
  customer: { id: string; name: string };
  /** Pre-filled: everything the customer owes. */
  balance: number;
  onPaid: (payment: DebtPaymentRecord) => void;
}

/** The customer pays (part of) what they owe. */
export function DebtPaymentForm({ customer, balance, onPaid }: DebtPaymentFormProps) {
  const [amount, setAmount] = useState(balance.toLocaleString('en-US'));
  const [note, setNote] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    await action.run(async () => {
      onPaid(await recordDebtPayment(customer, parseWholeNumber(amount), note));
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="المبلغ المدفوع (ل.س)"
          ltr
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Field label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <Button type="submit" disabled={action.busy} className="self-start">
        تسجيل الدفعة
      </Button>
    </form>
  );
}
