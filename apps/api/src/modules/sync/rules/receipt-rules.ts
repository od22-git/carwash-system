import { KEEP_SERVER_COPY, type Authorize, type WireRow } from '../sync-entry';

const isNotNewer = (incoming: WireRow, existing: WireRow | undefined) =>
  !!existing && Number(incoming.updatedAt) <= Number(existing.updatedAt);

/**
 * Rules for anything with a printed receipt (wash tickets, garage sessions, packages sold)
 * that the cashier's laptop cannot get around:
 * - only the admin cancels or deletes;
 * - once a receipt reaches a `locked` status (paid, cancelled), only the admin changes it.
 * Re-sending an old or identical version is accepted and changes nothing.
 */
export function receiptRules(locked: readonly string[]): Authorize {
  return (incoming, user, existing) => {
    if (isNotNewer(incoming, existing)) return KEEP_SERVER_COPY;
    if (user.role === 'admin') return null;
    if (incoming.status === 'cancelled' || incoming.deletedAt != null) return 'admin_only';
    if (existing && locked.includes(String(existing.status))) return 'locked';
    return null;
  };
}

/** A log entry, once on the server, is never rewritten (not even by the admin). */
export const appendOnly: Authorize = (incoming, _user, existing) => {
  if (!existing) return null;
  return isNotNewer(incoming, existing) ? KEEP_SERVER_COPY : 'append_only';
};

/**
 * A receipt either laptop may write once (e.g. a debt payment): after that only the admin
 * changes or deletes it. Re-sending the same version is accepted and changes nothing.
 */
export const cashierCreatesOnly: Authorize = (incoming, user, existing) => {
  if (isNotNewer(incoming, existing)) return KEEP_SERVER_COPY;
  if (user.role === 'admin') return null;
  if (incoming.deletedAt != null) return 'admin_only';
  return existing ? 'locked' : null;
};
