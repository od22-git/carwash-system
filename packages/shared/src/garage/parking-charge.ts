import type { Instant } from '../common';
import { applyCover } from './covered-fee';
import type { FeeResult } from './fee-result';
import type { GarageSettings } from './garage-settings';
import { parkingFee } from './parking-fee';
import type { ParkingSessionRecord } from './parking-session-record';

type ChargedSession = Pick<ParkingSessionRecord, 'enteredAt' | 'plan' | 'coveredUntil'>;

/** What a parked car pays when it leaves: its plan, less what its package covers. */
export function parkingCharge(
  session: ChargedSession,
  leftAt: Instant,
  settings: GarageSettings,
): FeeResult {
  const fee = parkingFee(session.enteredAt, leftAt, session.plan, settings);
  return applyCover(fee, session.coveredUntil, leftAt, settings);
}
