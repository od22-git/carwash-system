import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../core/db';
import { InvalidRecordError } from '../../../core/sync';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { savePackage, type PackageInput } from './package-actions';
import { cancelSubscription, sellPackage } from './subscription-actions';
import { customer, owner, vehicle } from './test-data';

const DAY = 86_400_000;
const monthly: PackageInput = {
  name: 'شهري',
  price: '500,000',
  days: '30',
  freeWashes: '4',
  washServiceIds: ['exterior'],
  includesParking: true,
  active: true,
};

describe('packages', () => {
  beforeEach(freshLaptop);
  afterEach(() => vi.useRealTimers());

  it('free washes need the services they cover', async () => {
    const noServices = savePackage({ ...monthly, washServiceIds: [] }, []);
    await expect(noServices).rejects.toBeInstanceOf(InvalidRecordError);
    const garageOnly = await savePackage({ ...monthly, freeWashes: '', washServiceIds: [] }, []);
    expect(garageOnly).toMatchObject({ freeWashes: 0, includesParking: true });
  });

  it('a sold package keeps its terms and lasts the package days', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-04T10:00:00'), toFake: ['Date'] });
    const pkg = await savePackage(monthly, []);
    const sub = await sellPackage({ customer, vehicle, pkg, startsAt: Date.now() });
    await savePackage({ ...monthly, freeWashes: '2' }, [], pkg.id);
    expect(sub).toMatchObject({ receiptNo: 'A-000001', price: 500_000, freeWashes: 4 });
    expect(sub.endsAt - sub.startsAt).toBe(30 * DAY);
    expect((await db.subscriptions.get(sub.id))?.freeWashes).toBe(4);
  });

  it('the admin cancels a package and it is logged', async () => {
    const pkg = await savePackage(monthly, []);
    const sub = await sellPackage({ customer, vehicle, pkg, startsAt: Date.now() });
    await cancelSubscription(sub, '', owner);
    expect((await db.subscriptions.get(sub.id))?.status).toBe('cancelled');
    expect((await db.auditEvents.toArray())[0]?.action).toBe('subscription.cancel');
  });
});
