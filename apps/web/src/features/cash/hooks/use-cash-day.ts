import { cashIn, type CashCloseRecord, type CashIn } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, inRange } from '../../../core/db';
import { periodRange } from '../../../shared/lib/period';

export interface CashDay {
  cash: CashIn;
  /** The day's close, if the drawer was closed. */
  close: CashCloseRecord | null;
  /** The float of the last close before this day: usually the same every day. */
  lastFloat: number;
}

/** The cash that came in on a day ("2026-10-04"), from both laptops, and its close. */
export function useCashDay(day: string): CashDay | undefined {
  return useLiveQuery(async () => {
    const range = periodRange({ kind: 'day', day });
    const [tickets, parkingSessions, subscriptions, sales, debtPayments, close, earlier] =
      await Promise.all([
        inRange(db.tickets, 'deliveredAt', range),
        inRange(db.parkingSessions, 'leftAt', range),
        inRange(db.subscriptions, 'createdAt', range),
        inRange(db.sales, 'soldAt', range),
        inRange(db.debtPayments, 'at', range),
        db.cashCloses.get(day),
        db.cashCloses
          .where('day')
          .below(day)
          .reverse()
          .filter((c) => !c.deletedAt)
          .first(),
      ]);
    const input = { tickets, parkingSessions, subscriptions, sales, debtPayments };
    return {
      cash: cashIn(input, ...range),
      close: close && !close.deletedAt ? close : null,
      lastFloat: earlier?.float ?? 0,
    };
  }, [day]);
}
