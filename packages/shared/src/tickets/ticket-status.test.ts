import { describe, expect, it } from 'vitest';
import { canMoveTicket } from '.';

describe('canMoveTicket', () => {
  it('follows the wash order', () => {
    expect(canMoveTicket('waiting', 'washing')).toBe(true);
    expect(canMoveTicket('washing', 'grace')).toBe(true);
    expect(canMoveTicket('grace', 'delivered')).toBe(true);
  });

  it('does not skip steps or reopen closed tickets', () => {
    expect(canMoveTicket('waiting', 'delivered')).toBe(false);
    expect(canMoveTicket('delivered', 'washing')).toBe(false);
    expect(canMoveTicket('cancelled', 'waiting')).toBe(false);
  });
});
