import {
  WORKER_PAYMENT_KINDS,
  WORKER_PAYMENT_LABELS,
  type WorkerPaymentKind,
} from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { fromDateInput, toDateInput } from '../../../../shared/lib/date-input';
import { parseWholeNumber } from '../../../../shared/lib/parse-number';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, ChoiceGroup, Field, Notice, SelectField } from '../../../../shared/ui';
import { useWorkers } from '../../hooks/use-workers';
import { recordWorkerPayment } from '../../lib/payment-actions';

interface PaymentFormProps {
  workerId?: string;
  /** Pre-filled for a wage payment: what the worker is still owed. */
  suggested?: number;
  onDone: () => void;
}

const KINDS = WORKER_PAYMENT_KINDS.map((k) => ({ value: k, label: WORKER_PAYMENT_LABELS[k] }));

/** Money given to a worker: an advance during the period, or the wages at its end. */
export function PaymentForm({ workerId = '', suggested, onDone }: PaymentFormProps) {
  const workers = useWorkers().workers.filter((w) => w.active || w.id === workerId);
  const [worker, setWorker] = useState(workerId);
  const [kind, setKind] = useState<WorkerPaymentKind>(suggested ? 'wage' : 'advance');
  const [amount, setAmount] = useState(suggested ? suggested.toLocaleString('en-US') : '');
  const [day, setDay] = useState(() => toDateInput(Date.now()));
  const [note, setNote] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = { workerId: worker, kind, amount: parseWholeNumber(amount), note };
    const at = fromDateInput(day, Date.now());
    if (await action.run(() => recordWorkerPayment({ ...input, at }))) onDone();
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <SelectField
        label="العامل"
        placeholder="اختر العامل"
        options={workers.map((w) => ({ value: w.id, label: w.name }))}
        value={worker}
        onChange={(e) => setWorker(e.target.value)}
      />
      <ChoiceGroup legend="النوع" choices={KINDS} value={kind} onChange={setKind} />
      <Field
        label="المبلغ (ل.س)"
        ltr
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Field label="التاريخ" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      <Field
        label="ملاحظة (اختياري)"
        className="sm:col-span-2"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex flex-col gap-3 sm:col-span-2">
        {action.error && <Notice tone="error">{action.error}</Notice>}
        <div className="flex gap-2">
          <Button type="submit" disabled={action.busy}>
            تسجيل الدفعة
          </Button>
          <Button variant="secondary" onClick={onDone}>
            تراجع
          </Button>
        </div>
      </div>
    </form>
  );
}
