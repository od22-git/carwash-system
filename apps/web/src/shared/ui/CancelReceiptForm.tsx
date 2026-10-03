import { useState, type FormEvent } from 'react';
import { useAction } from '../lib/use-action';
import { Button } from './Button';
import { Field } from './Field';
import { Notice } from './Notice';

interface CancelReceiptFormProps {
  /** Cancels and logs; the reason may be empty. */
  onConfirm: (reason: string) => Promise<unknown>;
  onDone: () => void;
}

/** Admin only. The reason is optional; the cancellation is logged either way. */
export function CancelReceiptForm({ onConfirm, onDone }: CancelReceiptFormProps) {
  const [reason, setReason] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => onConfirm(reason))) onDone();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-lg border border-status-grace/40 bg-status-grace/5 p-3"
    >
      <Field
        label="سبب الإلغاء (اختياري)"
        maxLength={200}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {action.error && <Notice tone="error">{action.error}</Notice>}
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={action.busy}>
          تأكيد إلغاء الإيصال
        </Button>
        <Button variant="secondary" onClick={onDone}>
          تراجع
        </Button>
      </div>
    </form>
  );
}
