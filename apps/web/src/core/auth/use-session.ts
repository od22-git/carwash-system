import type { SessionUser } from '@carwash/shared';
import { useMeta } from '../db';

/** `undefined` while loading, `null` when logged out. */
export function useSessionUser(): SessionUser | null | undefined {
  const session = useMeta('session');
  return session === undefined ? undefined : (session?.user ?? null);
}
