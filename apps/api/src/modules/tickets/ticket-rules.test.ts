import { authorizeTicketChange } from './ticket-rules';

const cashier = { role: 'user' as const };
const admin = { role: 'admin' as const };
const row = (status: string, updatedAt: number) => ({ id: 't1', status, updatedAt });

describe('authorizeTicketChange', () => {
  it('lets the cashier move an open ticket forward', () => {
    expect(authorizeTicketChange(row('grace', 2), cashier, row('washing', 1))).toBeNull();
    expect(authorizeTicketChange(row('delivered', 3), cashier, row('grace', 2))).toBeNull();
  });

  it('only the admin cancels', () => {
    expect(authorizeTicketChange(row('cancelled', 2), cashier, row('washing', 1))).toBe(
      'admin_only',
    );
    expect(authorizeTicketChange(row('cancelled', 2), admin, row('delivered', 1))).toBeNull();
  });

  it('the cashier cannot change a delivered receipt', () => {
    expect(authorizeTicketChange(row('delivered', 5), cashier, row('delivered', 4))).toBe('locked');
  });

  it('re-sending the same version is harmless', () => {
    expect(authorizeTicketChange(row('delivered', 4), cashier, row('delivered', 4))).toBeNull();
  });
});
