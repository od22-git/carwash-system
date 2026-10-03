import type { Role } from '@carwash/shared';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { ZodType } from 'zod';
import type { AuthUser } from '../../common';

/** A table built with syncColumns(). */
export type SyncTable = PgTable & { id: AnyPgColumn; updatedAt: AnyPgColumn };

export type WireRow = Record<string, unknown>;

/**
 * authorize() result meaning "the server already has this (or newer)": the laptop's copy
 * is accepted so it leaves the outbox, but nothing is written.
 */
export const KEEP_SERVER_COPY = Symbol('keep-server-copy');

export type AuthorizeResult = string | null | typeof KEEP_SERVER_COPY;

export type Authorize = (
  incoming: WireRow,
  user: Pick<AuthUser, 'role'>,
  existing: WireRow | undefined,
) => AuthorizeResult;

/** How one feature's table takes part in sync. Each feature registers its own entry. */
export interface SyncEntry {
  /** Name used on the wire and in the laptop's local database. */
  name: string;
  table: SyncTable;
  /** Validates a pushed row; unknown fields are dropped. */
  schema: ZodType<WireRow>;
  pushRoles: Role[];
  pullRoles: Role[];
  /** Optional: hide fields from some roles on pull (e.g. purchase cost from the cashier). */
  project?: (row: WireRow, user: AuthUser) => WireRow;
  /**
   * Optional: rules that depend on the server's current copy, e.g. "only the admin may
   * cancel a receipt". Return null to save, a reason to refuse, or KEEP_SERVER_COPY.
   */
  authorize?: Authorize;
}
