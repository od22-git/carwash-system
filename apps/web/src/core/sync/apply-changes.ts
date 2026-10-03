import type { PullResponse } from '@carwash/shared';
import { db, isSyncedTable, type LocalRecord } from '../db';

/**
 * Saves rows pulled from the server. A row this laptop changed more recently and has not
 * pushed yet is kept, so pulling never undoes the cashier's newest work.
 */
export async function applyChanges(changes: PullResponse['changes']): Promise<void> {
  for (const { table, rows } of changes) {
    if (!isSyncedTable(table)) continue;
    const store = db.table<LocalRecord, string>(table);

    await db.transaction('rw', store, db.outbox, async () => {
      const pending = await db.outbox.where('table').equals(table).toArray();
      const pendingUpdatedAt = new Map(pending.map((e) => [e.rowId, e.row.updatedAt]));
      const incoming = (rows as LocalRecord[]).filter(
        (row) => (pendingUpdatedAt.get(row.id) ?? -1) <= row.updatedAt,
      );
      await store.bulkPut(incoming);
    });
  }
}
