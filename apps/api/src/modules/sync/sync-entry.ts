import type { Role } from '@carwash/shared';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { ZodType } from 'zod';
import type { AuthUser } from '../../common';

/** A table built with syncColumns(). */
export type SyncTable = PgTable & { id: AnyPgColumn; updatedAt: AnyPgColumn };

export type WireRow = Record<string, unknown>;

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
}
