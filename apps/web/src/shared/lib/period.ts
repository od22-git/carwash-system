import { dayRange, fromDateInput, monthRange, toDateInput } from './date-input';
import { formatDate, formatMonth } from './time-format';
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

/** For file names and titles: "2026-10-04", "أسبوع 2026-10-03" or "2026-10". */
export function periodLabel(period: Period, now = Date.now()): string {
  if (period.kind === 'day') return period.day;
  if (period.kind === 'month') return period.day.slice(0, 7);
  return `أسبوع ${toDateInput(periodRange(period, now)[0])}`;
}

/** For report titles: "04/10/2026", "أسبوع 03/10/2026" or "تشرين الأول 2026". */
export function periodTitle(period: Period, now = Date.now()): string {
  if (period.kind === 'month') return formatMonth(period.day.slice(0, 7));
  const from = formatDate(periodRange(period, now)[0]);
  return period.kind === 'week' ? `أسبوع ${from}` : from;
}
