import { describe, expect, it } from 'vitest';
import {
  currentSubscription,
  nextSubscriptionStart,
  packageRecordSchema,
  packageWashDiscount,
  subscriptionEnd,
  washesLeft,
} from '.';

const DAY = 86_400_000;
const now = new Date('2026-10-03T10:00:00Z').getTime();
const sub = (id: string, startsAt: number, endsAt: number, status = 'active' as const) => ({
  id,
  vehicleId: 'v1',
  status,
  startsAt,
  endsAt,
  deletedAt: null,
  freeWashes: 4,
});
const base = { id: 'p1', createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };

describe('packages', () => {
  it('a package gives free washes (with their services), the garage, or both', () => {
    const pkg = { ...base, name: 'شهري', price: 500_000, durationDays: 30, active: true };
    const ok = {
      ...pkg,
      sortOrder: 1,
      freeWashes: 4,
      washServiceIds: ['s1'],
      includesParking: true,
    };
    expect(packageRecordSchema.safeParse(ok).success).toBe(true);
    expect(packageRecordSchema.safeParse({ ...ok, washServiceIds: [] }).success).toBe(false);
    const empty = { ...ok, freeWashes: 0, includesParking: false };
    expect(packageRecordSchema.safeParse(empty).success).toBe(false);
  });
});

describe('subscriptions', () => {
  it('lasts the package days', () => {
    expect(subscriptionEnd(now, 30)).toBe(now + 30 * DAY);
  });

  it('finds the car package in use now, ignoring ended, future and cancelled ones', () => {
    const subs = [
      sub('ended', now - 40 * DAY, now - 10 * DAY),
      sub('renewal', now + 5 * DAY, now + 35 * DAY),
      sub('cancelled', now - DAY, now + DAY, 'cancelled' as never),
      sub('current', now - 25 * DAY, now + 5 * DAY),
    ];
    expect(currentSubscription(subs, 'v1', now)?.id).toBe('current');
    expect(currentSubscription(subs, 'v2', now)).toBeUndefined();
  });

  it('a renewal starts when the current package ends', () => {
    expect(nextSubscriptionStart([sub('a', now - DAY, now + 5 * DAY)], 'v1', now)).toBe(
      now + 5 * DAY,
    );
    expect(nextSubscriptionStart([], 'v1', now)).toBe(now);
  });

  it('counts free washes left and what one takes off the bill', () => {
    expect(washesLeft({ freeWashes: 4 }, 1)).toBe(3);
    expect(washesLeft({ freeWashes: 4 }, 6)).toBe(0);
    const lines = [
      { serviceId: 'exterior', price: 25_000 },
      { serviceId: 'underbody', price: 20_000 },
    ];
    expect(packageWashDiscount(lines, ['exterior'])).toBe(25_000);
  });
});
