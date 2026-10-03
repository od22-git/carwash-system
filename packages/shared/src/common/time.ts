export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;

export type Instant = Date | number;

export const toMs = (t: Instant): number => (typeof t === 'number' ? t : t.getTime());

/** Whole started hours in a duration: 0 ms -> 0, 1 ms -> 1, exactly 1 h -> 1. */
export function startedHours(durationMs: number): number {
  return durationMs <= 0 ? 0 : Math.ceil(durationMs / HOUR_MS);
}
