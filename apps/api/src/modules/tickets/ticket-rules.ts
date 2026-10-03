import type { AuthUser } from '../../common';
import type { WireRow } from '../sync';

const LOCKED = ['delivered', 'cancelled'];

/**
 * Receipt rules the cashier's laptop cannot get around:
 * - only the admin cancels a receipt;
 * - once a car is delivered (paid) or cancelled, only the admin may change that receipt.
 * Re-sending an old or identical version is always fine (it changes nothing).
 */
export function authorizeTicketChange(
  incoming: WireRow,
  user: Pick<AuthUser, 'role'>,
  existing: WireRow | undefined,
): string | null {
  if (user.role === 'admin') return null;
  const isNewer = !existing || Number(incoming.updatedAt) > Number(existing.updatedAt);
  if (!isNewer) return null;
  if (incoming.status === 'cancelled') return 'admin_only';
  if (existing && LOCKED.includes(String(existing.status))) return 'locked';
  return null;
}
