import { HOUR_MS, MINUTE_MS, startedHours, toMs, type Instant } from '../common';
import { NO_FEE, type FeeResult } from './fee-result';
import type { GarageSettings } from './garage-settings';
import type { ParkingPlan } from './parking-plan';

/**
 * Fee for a normal parking session.
 * - hourly: free for the first parkingFreeMinutes, then every started hour from the start.
 * - fixed:  the plan price; time past the plan's duration is charged per started hour.
 */
export function parkingFee(
  enteredAt: Instant,
  leftAt: Instant,
  plan: ParkingPlan,
  settings: GarageSettings,
): FeeResult {
  const elapsed = toMs(leftAt) - toMs(enteredAt);

  if (plan.kind === 'hourly') {
    if (elapsed <= settings.parkingFreeMinutes * MINUTE_MS) return NO_FEE;
    const billedHours = startedHours(elapsed);
    return { fee: billedHours * settings.hourlyRate, billedHours };
  }

  const overtimeHours = startedHours(elapsed - plan.durationHours * HOUR_MS);
  return { fee: plan.price + overtimeHours * settings.hourlyRate, billedHours: overtimeHours };
}
