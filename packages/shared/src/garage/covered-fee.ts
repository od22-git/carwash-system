import { startedHours, toMs, type Instant } from '../common';
import { NO_FEE, type FeeResult } from './fee-result';
import type { GarageSettings } from './garage-settings';

/**
 * A car whose package includes the garage parks free until the package ends.
 * If it stays longer, only the started hours after the end are charged
 * (or the normal fee, if that is less).
 */
export function applyCover(
  fee: FeeResult,
  coveredUntil: number | null,
  leftAt: Instant,
  settings: GarageSettings,
): FeeResult {
  if (coveredUntil === null) return fee;
  const afterCover = toMs(leftAt) - coveredUntil;
  if (afterCover <= 0) return NO_FEE;
  const billedHours = startedHours(afterCover);
  const covered = { fee: billedHours * settings.hourlyRate, billedHours };
  return covered.fee < fee.fee ? covered : fee;
}
