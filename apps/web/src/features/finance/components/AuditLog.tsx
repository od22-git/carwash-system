import { AUDIT_ACTION_LABELS } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';
import { formatDate, formatTime } from '../../../shared/lib/time-format';
import { Table } from '../../../shared/ui';

const SHOWN = 50;

/** Who cancelled or deleted what, and why: the latest sensitive actions on both laptops. */
export function AuditLog() {
  const events = useLiveQuery(
    () => db.auditEvents.orderBy('createdAt').reverse().limit(SHOWN).toArray(),
    [],
  );
  if (!events) return null;
  if (events.length === 0) return <p className="text-muted">لا توجد عمليات إلغاء أو حذف.</p>;

  return (
    <Table headers={['الوقت', 'العملية', 'التفاصيل', 'بواسطة', 'السبب']} minWidth="44rem">
      {events.map((e) => (
        <tr key={e.id} className="border-b border-line last:border-0">
          <td className="px-3 py-2 tabular-nums">
            {formatDate(e.createdAt)} {formatTime(e.createdAt)}
          </td>
          <td className="px-3 py-2 font-semibold">{AUDIT_ACTION_LABELS[e.action]}</td>
          <td className="px-3 py-2">{e.summary}</td>
          <td className="px-3 py-2">{e.userName}</td>
          <td className="px-3 py-2 text-muted">{e.reason || '—'}</td>
        </tr>
      ))}
    </Table>
  );
}
