import { describe, expect, it } from 'vitest';
import { DEFAULT_GARAGE_SETTINGS as S, graceRemainingMs, pickupGarageFee } from '.';

const min = (m: number) => m * 60_000;
const t0 = new Date('2026-10-03T10:00:00Z').getTime();

describe('pickupGarageFee (15 min grace, 10,000 per hour)', () => {
  it.each([0, 14, 15])('picked up after %i min -> free', (m) => {
    expect(pickupGarageFee(t0, t0 + min(m), S).fee).toBe(0);
  });

  it('16 min -> one started hour after the grace', () => {
    expect(pickupGarageFee(t0, t0 + min(16), S)).toEqual({ fee: 10_000, billedHours: 1 });
  });

  it('75 min -> exactly one hour after the grace', () => {
    expect(pickupGarageFee(t0, t0 + min(75), S).billedHours).toBe(1);
  });

  it('76 min -> two hours after the grace', () => {
    expect(pickupGarageFee(t0, t0 + min(76), S).billedHours).toBe(2);
  });

  it('customer comes 4 hours after the grace (the case the owner described)', () => {
    expect(pickupGarageFee(t0, t0 + min(255), S)).toEqual({ fee: 40_000, billedHours: 4 });
  });

  it('chargeFromNotice counts from minute 0 once the grace is passed', () => {
    const s = { ...S, chargeFromNotice: true };
    expect(pickupGarageFee(t0, t0 + min(15), s).fee).toBe(0);
    expect(pickupGarageFee(t0, t0 + min(75), s).billedHours).toBe(2);
  });

  it('accepts Date objects', () => {
    expect(pickupGarageFee(new Date(t0), new Date(t0 + min(30)), S).fee).toBe(10_000);
  });
});

describe('graceRemainingMs', () => {
  it('counts down and never goes negative', () => {
    expect(graceRemainingMs(t0, t0 + min(5), S)).toBe(min(10));
    expect(graceRemainingMs(t0, t0 + min(40), S)).toBe(0);
  });
});
