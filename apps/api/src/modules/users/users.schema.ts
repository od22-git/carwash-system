import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { epochMs } from '../../database/columns';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: epochMs('created_at')
    .notNull()
    .$defaultFn(() => Date.now()),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
