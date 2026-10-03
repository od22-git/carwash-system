import { startOfDay } from './time-format';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local day as an <input type="date"> value: "2026-10-04". */
export function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local month as an <input type="month"> value: "2026-10". */
export const toMonthInput = (ms: number) => toDateInput(ms).slice(0, 7);

/**
 * When something entered for a day happened: now if the day is today,
 * otherwise midday of that day (so it falls inside the day in every report).
 */
export function fromDateInput(value: string, now: number): number {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return now;
  const midday = new Date(y, m - 1, d, 12).getTime();
  return startOfDay(midday) === startOfDay(now) ? now : midday;
}

/** [start, end) of the local day containing `ms`. */
export function dayRange(ms: number): [number, number] {
  const start = startOfDay(ms);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start, end.getTime()];
}

/** [start, end) of a month given as "2026-10". */
export function monthRange(month: string): [number, number] {
  const [y, m] = month.split('-').map(Number);
  return [new Date(y!, m! - 1, 1).getTime(), new Date(y!, m!, 1).getTime()];
}
