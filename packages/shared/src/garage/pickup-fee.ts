import { MINUTE_MS, startedHours, toMs, type Instant } from '../common';
import { NO_FEE, type FeeResult } from './fee-result';
import type { GarageSettings } from './garage-settings';

/**
 * Fee for a washed car that stayed after the WhatsApp "your car is ready" notice.
 * - Picked up within the grace period -> no fee.
 * - Later -> hourly rate per started hour, counted from the notice or from the end of
 *   the grace period, depending on settings.chargeFromNotice.
 */
export function pickupGarageFee(
  notifiedAt: Instant,
  pickedUpAt: Instant,
  settings: GarageSettings,
): FeeResult {
  const elapsed = toMs(pickedUpAt) - toMs(notifiedAt);
  const graceMs = settings.pickupGraceMinutes * MINUTE_MS;
  if (elapsed <= graceMs) return NO_FEE;

  const billable = settings.chargeFromNotice ? elapsed : elapsed - graceMs;
  const billedHours = startedHours(billable);
  return { fee: billedHours * settings.hourlyRate, billedHours };
}

/** Milliseconds left in the pickup grace period (never negative). Drives the on-screen countdown. */
export function graceRemainingMs(notifiedAt: Instant, now: Instant, settings: GarageSettings) {
  const graceEnd = toMs(notifiedAt) + settings.pickupGraceMinutes * MINUTE_MS;
  return Math.max(0, graceEnd - toMs(now));
}
