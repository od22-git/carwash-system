import { KEEP_SERVER_COPY } from '../sync-entry';
import { appendOnly, cashierCreatesOnly, receiptRules } from './receipt-rules';

const cashier = { role: 'user' as const };
const admin = { role: 'admin' as const };
const row = (status: string, updatedAt: number, deletedAt: number | null = null) => ({
  id: 't1',
  status,
  updatedAt,
  deletedAt,
});
const ticketRule = receiptRules(['delivered', 'cancelled']);

describe('receiptRules', () => {
  it('lets the cashier move an open receipt forward', () => {
    expect(ticketRule(row('grace', 2), cashier, row('washing', 1))).toBeNull();
    expect(ticketRule(row('delivered', 3), cashier, row('grace', 2))).toBeNull();
  });

  it('only the admin cancels or deletes', () => {
    expect(ticketRule(row('cancelled', 2), cashier, row('washing', 1))).toBe('admin_only');
    expect(ticketRule(row('washing', 2, 2), cashier, row('washing', 1))).toBe('admin_only');
    expect(ticketRule(row('cancelled', 2), admin, row('delivered', 1))).toBeNull();
  });

  it('the cashier cannot change a paid receipt', () => {
    expect(ticketRule(row('delivered', 5), cashier, row('delivered', 4))).toBe('locked');
  });

  it('re-sending the same or an older version keeps the server copy', () => {
    expect(ticketRule(row('delivered', 4), cashier, row('delivered', 4))).toBe(KEEP_SERVER_COPY);
    expect(ticketRule(row('grace', 3), admin, row('delivered', 4))).toBe(KEEP_SERVER_COPY);
  });
});

describe('appendOnly', () => {
  it('accepts a new entry and a retry, refuses a rewrite', () => {
    expect(appendOnly(row('x', 1), cashier, undefined)).toBeNull();
    expect(appendOnly(row('x', 1), cashier, row('x', 1))).toBe(KEEP_SERVER_COPY);
    expect(appendOnly(row('x', 2), admin, row('x', 1))).toBe('append_only');
  });
});

describe('cashierCreatesOnly', () => {
  it('the cashier writes it once; only the admin changes or deletes it', () => {
    expect(cashierCreatesOnly(row('x', 1), cashier, undefined)).toBeNull();
    expect(cashierCreatesOnly(row('x', 1), cashier, row('x', 1))).toBe(KEEP_SERVER_COPY);
    expect(cashierCreatesOnly(row('x', 2), cashier, row('x', 1))).toBe('locked');
    expect(cashierCreatesOnly(row('x', 2, 2), cashier, row('x', 1))).toBe('admin_only');
    expect(cashierCreatesOnly(row('x', 2, 2), admin, row('x', 1))).toBeNull();
  });
});
