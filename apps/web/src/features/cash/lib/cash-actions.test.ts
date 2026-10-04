import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { closeCash, reopenCash, type CloseInput } from './cash-actions';

const cashier = { id: 'u2', name: 'موظف الاستقبال', username: 'c', role: 'user' as const };
const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };
const today: CloseInput = {
  day: '2026-10-04',
  expected: 645_000,
  float: '50,000',
  paidOut: '',
  counted: '690000',
  note: ' ',
};

describe('cash close', () => {
  beforeEach(async () => {
    await freshLaptop();
    vi.useFakeTimers({ now: new Date('2026-10-04T21:00:00'), toFake: ['Date'] });
  });
  afterEach(() => vi.useRealTimers());

  it('closes the day once, by its date', async () => {
    const close = await closeCash(today, cashier);
    expect(close).toMatchObject({
      id: '2026-10-04',
      float: 50_000,
      paidOut: 0,
      counted: 690_000,
      closedBy: 'موظف الاستقبال',
      note: '',
    });
    await expect(closeCash(today, cashier)).rejects.toThrow('أُغلق صندوق هذا اليوم من قبل.');
  });

  it('needs the counted cash, in numbers, and not a future day', async () => {
    await expect(closeCash({ ...today, counted: '' }, cashier)).rejects.toThrow(
      'اكتب المبلغ الموجود في الصندوق.',
    );
    await expect(closeCash({ ...today, paidOut: 'abc' }, cashier)).rejects.toThrow(
      'اكتب المبالغ بالأرقام.',
    );
    await expect(closeCash({ ...today, day: '2026-10-05' }, cashier)).rejects.toThrow(
      'لا يمكن إغلاق يوم لم يأتِ بعد.',
    );
  });

  it('the admin reopens a day (logged), and it can be closed again', async () => {
    await reopenCash(await closeCash(today, cashier), owner);
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({
      action: 'cash-close.reopen',
      summary: '2026-10-04 (690,000 ل.س)',
    });
    const again = await closeCash({ ...today, counted: '695,000' }, cashier);
    expect(again).toMatchObject({ counted: 695_000, deletedAt: null });
  });
});
