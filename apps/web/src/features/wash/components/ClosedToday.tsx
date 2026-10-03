import { formatSYP } from '@carwash/shared';
import { startOfDay } from '../../../shared/lib/time-format';
import { useClosedTicketsSince } from '../hooks/use-tickets';
import { ClosedTicketRow } from './ClosedTicketRow';

const HEADERS = ['الإيصال', 'اللوحة', 'العميل', 'العامل', 'الوقت', 'المبلغ', ''];

/** Cars delivered (or cancelled) today, with the day's wash income. */
export function ClosedToday({ now }: { now: number }) {
  const tickets = useClosedTicketsSince(startOfDay(now)) ?? [];
  const income = tickets
    .filter((t) => t.status === 'delivered')
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <section aria-label="سُلّمت اليوم" className="flex flex-col gap-3">
      <h2 className="flex flex-wrap items-baseline gap-3 font-display text-lg font-bold">
        سُلّمت اليوم
        <span className="font-body text-base font-normal text-muted">
          {tickets.length} سيارة، الدخل {formatSYP(income)}
        </span>
      </h2>
      {tickets.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                {HEADERS.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2.5 text-start font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <ClosedTicketRow key={t.id} ticket={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
