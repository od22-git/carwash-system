import { customType, text } from 'drizzle-orm/pg-core';

/**
 * A point in time stored as `timestamptz` in PostgreSQL (good for reports)
 * but handled as epoch milliseconds in code and on the wire (easy to compare and sync).
 */
export const epochMs = customType<{ data: number; driverData: Date | string }>({
  dataType: () => 'timestamp with time zone',
  toDriver: (value) => new Date(value).toISOString(),
  fromDriver: (value) => new Date(value).getTime(),
});

/** Columns every synced table has. Must match `syncRecordBase` in @carwash/shared. */
export const syncColumns = () => ({
  id: text('id').primaryKey(),
  createdAt: epochMs('created_at').notNull(),
  updatedAt: epochMs('updated_at').notNull(),
  deviceId: text('device_id').notNull(),
  deletedAt: epochMs('deleted_at'),
});
