import type { TicketRecord } from '@carwash/shared';
import { useState, type FormEvent } from 'react';
import { useAction } from '../../../../shared/lib/use-action';
import { Button, Field, Notice } from '../../../../shared/ui';
import { useWash } from '../../hooks/wash-context';
import { cancelTicket } from '../../lib/ticket-actions';

/** Admin only. The reason is optional; the cancellation is logged either way. */
export function CancelTicketForm({ ticket, onDone }: { ticket: TicketRecord; onDone: () => void }) {
  const { user } = useWash();
  const [reason, setReason] = useState('');
  const action = useAction();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await action.run(() => cancelTicket(ticket, reason, user))) onDone();
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
