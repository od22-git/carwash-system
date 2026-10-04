import type { SYP } from '../common';
import type { CashCloseRecord } from './cash-close-record';

/**
 * Counted minus what should be there (float + cash in − cash taken out).
 * Below zero the drawer is short (عجز); above zero there is extra (زيادة).
 */
export function cashDifference(
  c: Pick<CashCloseRecord, 'expected' | 'float' | 'paidOut' | 'counted'>,
): SYP {
  return c.counted - (c.float + c.expected - c.paidOut);
}
