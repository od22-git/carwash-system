import { formatSYP } from '@carwash/shared';
import { Table } from '../../../../shared/ui';
import { useGarage } from '../../hooks/garage-context';
import { useParkingClosedSince } from '../../hooks/use-parking-sessions';
import { useSubscriptionsSoldSince } from '../../hooks/use-subscriptions';
import { parkingEntry, subscriptionEntry } from './today-entries';
import { TODAY_HEADERS, TodayRow } from './TodayRow';

/** Today's garage receipts (cars that left) and packages sold, with the day's income. */
export function GarageToday({ today }: { today: number }) {
  const { user } = useGarage();
  const sessions = useParkingClosedSince(today) ?? [];
  const subs = useSubscriptionsSoldSince(today) ?? [];
  const entries = [
    ...sessions.map((s) => parkingEntry(s, user)),
    ...subs.map((s) => subscriptionEntry(s, user)),
  ].sort((a, b) => b.at - a.at);
  const income = entries.filter((e) => !e.cancelled).reduce((sum, e) => sum + e.amount, 0);

  return (
    <section aria-label="إيصالات اليوم" className="flex flex-col gap-3">
      <h2 className="flex flex-wrap items-baseline gap-3 font-display text-lg font-bold">
        إيصالات اليوم
        <span className="font-body text-base font-normal text-muted">
          {entries.length} إيصال، الدخل {formatSYP(income)}
        </span>
      </h2>
      {entries.length > 0 && (
        <Table headers={TODAY_HEADERS} minWidth="44rem">
          {entries.map((e) => (
            <TodayRow key={e.id} entry={e} />
          ))}
        </Table>
      )}
    </section>
  );
}
