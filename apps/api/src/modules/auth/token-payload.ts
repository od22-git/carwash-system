import type { Role } from '@carwash/shared';

/** What is inside the login token. Kept small; the user is re-checked on every request. */
export interface TokenPayload {
  sub: string;
  role: Role;
  name: string;
}
