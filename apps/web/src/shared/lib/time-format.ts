const pad = (n: number) => String(n).padStart(2, '0');

/** 14:05 (Latin digits, 24 h), the way the shop reads the clock on receipts. */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 04/10/2026 */
export function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Month names as used in Syria. */
const MONTHS = [
  'كانون الثاني',
  'شباط',
  'آذار',
  'نيسان',
  'أيار',
  'حزيران',
  'تموز',
  'آب',
  'أيلول',
  'تشرين الأول',
  'تشرين الثاني',
  'كانون الأول',
];

/** "2026-10" -> "تشرين الأول 2026" (for report titles). */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${year}`;
}

/** 9:41 for a countdown (minutes:seconds). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

/** "1 س 20 د" / "2 ي 3 س" style durations, short enough for a card. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ي ${hours % 24} س`;
  return hours > 0 ? `${hours} س ${minutes % 60} د` : `${minutes} د`;
}

/** Local midnight of the day containing `ms`. */
export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** The time if `ms` is today, else the date and time (a car parked since yesterday). */
export function formatWhen(ms: number, now: number): string {
  return startOfDay(ms) === startOfDay(now)
    ? formatTime(ms)
    : `${formatDate(ms)} ${formatTime(ms)}`;
}
