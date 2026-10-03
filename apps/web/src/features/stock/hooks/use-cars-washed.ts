import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';

/** Cars that came for a wash in [from, to), cancelled ones left out (for waste per car). */
export function useCarsWashed(from: number, to: number): number | undefined {
  return useLiveQuery(
    async () =>
      (await db.tickets.where('arrivedAt').between(from, to, true, false).toArray()).filter(
        (t) => !t.deletedAt && t.status !== 'cancelled',
      ).length,
    [from, to],
  );
}
