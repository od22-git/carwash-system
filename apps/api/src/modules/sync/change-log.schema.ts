import { bigserial, pgTable, text } from 'drizzle-orm/pg-core';
import { epochMs } from '../../database/columns';

/**
 * One line per saved change, in order. Laptops pull "everything after seq N",
 * which makes paging simple and never misses a change.
 */
export const changeLog = pgTable('change_log', {
  seq: bigserial('seq', { mode: 'number' }).primaryKey(),
  tableName: text('table_name').notNull(),
  rowId: text('row_id').notNull(),
  changedAt: epochMs('changed_at')
    .notNull()
    .$defaultFn(() => Date.now()),
});

export type ChangeLogRow = Pick<typeof changeLog.$inferSelect, 'seq' | 'tableName' | 'rowId'>;
