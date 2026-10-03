import { jsonb, pgTable } from 'drizzle-orm/pg-core';
import { syncColumns } from '../../database/columns';

/** Key/value settings (garage rates, receipt text, WhatsApp message). id = setting key. */
export const settings = pgTable('settings', {
  ...syncColumns(),
  value: jsonb('value').notNull(),
});
