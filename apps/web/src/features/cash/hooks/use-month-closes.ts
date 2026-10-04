import type { CashCloseRecord } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/db';

/** The month's closes ("2026-10"), latest day first. */
export function useMonthCloses(month: string): CashCloseRecord[] | undefined {
  return useLiveQuery(async () => {
    const closes = await db.cashCloses.where('day').startsWith(`${month}-`).toArray();
    return closes.filter((c) => !c.deletedAt).sort((a, b) => b.day.localeCompare(a.day));
  }, [month]);
}
