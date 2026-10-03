import { startOfDay } from './time-format';

const SATURDAY = 6;

/** Local midnight of the Saturday starting the week that contains `ms` (Syrian work week). */
export function startOfWeek(ms: number): number {
  const day = new Date(startOfDay(ms));
  const sinceSaturday = (day.getDay() - SATURDAY + 7) % 7;
  day.setDate(day.getDate() - sinceSaturday);
  return day.getTime();
}

/** [Saturday 00:00, next Saturday 00:00) of the week containing `ms`. */
export function weekRange(ms: number): [number, number] {
  const start = new Date(startOfWeek(ms));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start.getTime(), end.getTime()];
}
