import { describe, expect, it } from 'vitest';
import { DEFAULT_GARAGE_SETTINGS as S, parkingFee, type ParkingPlan } from '.';

const min = (m: number) => m * 60_000;
const t0 = new Date('2026-10-03T10:00:00Z').getTime();

describe('parkingFee', () => {
  it('hourly: first 15 min free, then every started hour from the start', () => {
    const plan: ParkingPlan = { kind: 'hourly' };
    expect(parkingFee(t0, t0 + min(15), plan, S).fee).toBe(0);
    expect(parkingFee(t0, t0 + min(16), plan, S).fee).toBe(10_000);
    expect(parkingFee(t0, t0 + min(61), plan, S).fee).toBe(20_000);
  });

  it('fixed day plan: plan price, overtime per started hour', () => {
    const day: ParkingPlan = { kind: 'fixed', durationHours: 24, price: 150_000 };
    expect(parkingFee(t0, t0 + min(60 * 10), day, S).fee).toBe(150_000);
    expect(parkingFee(t0, t0 + min(60 * 24), day, S).fee).toBe(150_000);
    expect(parkingFee(t0, t0 + min(60 * 24 + 1), day, S).fee).toBe(160_000);
  });
});
