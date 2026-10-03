import { describe, expect, it } from 'vitest';
import { DEFAULT_GARAGE_SETTINGS as S } from '../garage';
import { canMoveTicket, deliveryTotals, isOpenTicket, sumLines } from '.';

const min = (m: number) => m * 60_000;

describe('canMoveTicket', () => {
  it('follows the wash order', () => {
    expect(canMoveTicket('waiting', 'washing')).toBe(true);
    expect(canMoveTicket('washing', 'grace')).toBe(true);
    expect(canMoveTicket('grace', 'delivered')).toBe(true);
  });

  it('lets a customer who waited take the car straight after washing', () => {
    expect(canMoveTicket('washing', 'delivered')).toBe(true);
  });

  it('does not skip steps or reopen closed tickets', () => {
    expect(canMoveTicket('waiting', 'delivered')).toBe(false);
    expect(canMoveTicket('delivered', 'washing')).toBe(false);
    expect(canMoveTicket('cancelled', 'waiting')).toBe(false);
  });

  it('allows cancelling even after delivery (admin only, checked elsewhere)', () => {
    expect(canMoveTicket('delivered', 'cancelled')).toBe(true);
  });

  it('knows which tickets are still on the board', () => {
    expect(isOpenTicket('grace')).toBe(true);
    expect(isOpenTicket('delivered')).toBe(false);
  });
});

describe('deliveryTotals', () => {
  const t0 = 1_000_000;
  const notified = { washTotal: 45_000, notifiedAt: t0 };

  it('adds lines up', () => {
    expect(sumLines([{ price: 25_000 }, { price: 20_000 }])).toBe(45_000);
  });

  it('no garage fee when picked up within the grace period', () => {
    expect(deliveryTotals(notified, t0 + min(15), S)).toEqual({
      garageFee: 0,
      garageHours: 0,
      total: 45_000,
    });
  });

  it('adds the garage fee when the customer is late', () => {
    expect(deliveryTotals(notified, t0 + min(255), S)).toEqual({
      garageFee: 40_000,
      garageHours: 4,
      total: 85_000,
    });
  });

  it('no garage fee when the customer was never notified (waited at the shop)', () => {
    expect(deliveryTotals({ washTotal: 45_000, notifiedAt: null }, t0 + min(500), S).total).toBe(
      45_000,
    );
  });
});
