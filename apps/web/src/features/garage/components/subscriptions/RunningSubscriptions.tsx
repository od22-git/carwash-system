import { Table } from '../../../../shared/ui';
import { useRunningSubscriptions } from '../../hooks/use-subscriptions';
import { SUBSCRIPTION_HEADERS, SubscriptionRow } from './SubscriptionRow';

/** Every package still running (or starting later), the soonest to end first. */
export function RunningSubscriptions({ now }: { now: number }) {
  const running = useRunningSubscriptions(now) ?? [];
  return (
    <section aria-label="الباقات الفعّالة" className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-2 font-display text-lg font-bold">
        الباقات الفعّالة
        <span className="font-body text-base font-normal text-muted">({running.length})</span>
      </h2>
      {running.length > 0 && (
        <Table headers={SUBSCRIPTION_HEADERS} minWidth="48rem">
          {running.map((entry) => (
            <SubscriptionRow key={entry.subscription.id} entry={entry} />
          ))}
        </Table>
      )}
    </section>
  );
}
