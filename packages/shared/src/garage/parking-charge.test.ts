import { describe, expect, it } from 'vitest';
import { DEFAULT_GARAGE_SETTINGS as S, applyCover, parkingCharge, type ParkingPlan } from '.';

const min = (m: number) => m * 60_000;
const t0 = new Date('2026-10-03T10:00:00Z').getTime();
const hourly: ParkingPlan = { kind: 'hourly' };
const day: ParkingPlan = { kind: 'fixed', durationHours: 24, price: 150_000 };

describe('parkingCharge', () => {
  it('charges the plan when the car has no package', () => {
    const session = { enteredAt: t0, plan: hourly, coveredUntil: null };
    expect(parkingCharge(session, t0 + min(80), S)).toEqual({ fee: 20_000, billedHours: 2 });
  });

  it('a package with the garage makes the stay free while it lasts', () => {
    const session = { enteredAt: t0, plan: day, coveredUntil: t0 + min(60 * 48) };
    expect(parkingCharge(session, t0 + min(60 * 30), S).fee).toBe(0);
  });

  it('after the package ends, only the started hours past the end are charged', () => {
    const session = { enteredAt: t0, plan: hourly, coveredUntil: t0 + min(60) };
    expect(parkingCharge(session, t0 + min(60 * 3 + 10), S)).toEqual({
      fee: 30_000,
      billedHours: 3,
    });
  });
});

describe('applyCover', () => {
  it('never charges more than the normal fee', () => {
    const normal = { fee: 10_000, billedHours: 1 };
    expect(applyCover(normal, t0, t0 + min(60 * 5), S)).toEqual(normal);
  });
});
