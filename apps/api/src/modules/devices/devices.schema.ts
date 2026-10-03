import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { epochMs } from '../../database/columns';
import { users } from '../users/users.schema';

/** Each laptop registers once and gets its own receipt prefix. */
export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  prefix: text('prefix').notNull().unique(),
  registeredBy: uuid('registered_by')
    .notNull()
    .references(() => users.id),
  createdAt: epochMs('created_at')
    .notNull()
    .$defaultFn(() => Date.now()),
  lastSeenAt: epochMs('last_seen_at'),
});

export type DeviceRow = typeof devices.$inferSelect;
