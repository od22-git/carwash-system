import { pgTable, text } from 'drizzle-orm/pg-core';
import { syncColumns } from '../../database/columns';

/** Sensitive actions (e.g. receipt cancelled): who, when, what, why. Never edited. */
export const auditEvents = pgTable('audit_events', {
  ...syncColumns(),
  action: text('action').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  targetId: text('target_id').notNull(),
  summary: text('summary').notNull(),
  reason: text('reason').notNull().default(''),
});
