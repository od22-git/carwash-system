import { dayRange, fromDateInput, monthRange, toDateInput } from './date-input';
import { weekRange } from './week';

export type PeriodKind = 'day' | 'week' | 'month';

/** A report period: its kind and any day inside it ("2026-10-04"). */
export interface Period {
  kind: PeriodKind;
  day: string;
}

export const PERIOD_LABELS: Record<PeriodKind, string> = {
  day: 'يوم',
  week: 'أسبوع',
  month: 'شهر',
};

export const todayPeriod = (kind: PeriodKind, now = Date.now()): Period => ({
  kind,
  day: toDateInput(now),
});

/** [start, end) of the period. Weeks start on Saturday. */
export function periodRange(period: Period, now = Date.now()): [number, number] {
  const at = fromDateInput(period.day, now);
  if (period.kind === 'day') return dayRange(at);
  if (period.kind === 'week') return weekRange(at);
  return monthRange(period.day.slice(0, 7));
}
