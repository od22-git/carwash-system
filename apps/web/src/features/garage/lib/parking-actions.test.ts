import { DEFAULT_GARAGE_SETTINGS as S } from '@carwash/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { HOURLY_CHOICE, cancelParking, parkCar, planChoice, releaseCar } from './parking-actions';
import { savePlan } from './plan-actions';
import { customer, owner, vehicle } from './test-data';

const at = (time: string) => vi.setSystemTime(new Date(`2026-10-04T${time}:00`));
const park = (choice = HOURLY_CHOICE, coveredUntil: number | null = null) =>
  parkCar({ customer, vehicle, choice, coveredUntil, notes: '' });

describe('garage sessions', () => {
  beforeEach(async () => {
    await freshLaptop();
    vi.useFakeTimers({ toFake: ['Date'] });
    at('10:00');
  });
  afterEach(() => vi.useRealTimers());

  it('by the hour: the first 15 minutes are free, then every started hour', async () => {
    const session = await park();
    expect(session).toMatchObject({ receiptNo: 'A-000001', status: 'parked', planName: 'بالساعة' });
    at('11:20');
    expect(await releaseCar(session, S)).toMatchObject({ status: 'left', fee: 20_000 });
  });

  it('a car can leave on the customer account', async () => {
    const session = await park();
    at('12:00');
    expect(await releaseCar(session, S, true)).toMatchObject({ fee: 20_000, paidLater: true });
  });

  it('a day plan keeps its price even if the admin edits the plan later', async () => {
    const day = { name: 'يوم', hours: '24', price: '150,000', active: true };
    const plan = await savePlan(day, []);
    const session = await park(planChoice(plan));
    await savePlan({ ...day, price: '200,000' }, [], plan.id);
    at('20:00');
    expect((await releaseCar(session, S)).fee).toBe(150_000);
  });

  it('a car whose package covers the garage leaves without paying', async () => {
    const session = await park(HOURLY_CHOICE, Date.now() + 86_400_000);
    at('18:00');
    expect((await releaseCar(session, S)).fee).toBe(0);
  });

  it('the admin cancels a receipt and it is logged; a cancelled car cannot leave', async () => {
    const session = await park();
    const cancelled = await cancelParking(session, 'دخلت بالخطأ', owner);
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({ action: 'parking.cancel', reason: 'دخلت بالخطأ' });
    await expect(releaseCar(cancelled, S)).rejects.toThrow();
  });
});
