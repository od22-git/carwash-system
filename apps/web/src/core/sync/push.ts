import type { PushResponse } from '@carwash/shared';
import { api } from '../api';
import { db } from '../db';

const BATCH_SIZE = 200;

/** Sends queued changes to the server, oldest first, until the outbox is empty. */
export async function pushOutbox(): Promise<void> {
  for (;;) {
    const batch = await db.outbox.orderBy('seq').limit(BATCH_SIZE).toArray();
    if (batch.length === 0) return;

    const ops = batch.map((entry) => ({ table: entry.table, row: entry.row }));
    const result = await api<PushResponse>('/sync/push', { method: 'POST', body: { ops } });
    const refused = new Map(result.rejected.map((r) => [`${r.table}:${r.id}`, r.reason]));

    await db.transaction('rw', db.outbox, db.syncErrors, async () => {
      for (const entry of batch) {
        const reason = refused.get(`${entry.table}:${entry.rowId}`);
        if (reason) {
          await db.syncErrors.add({
            table: entry.table,
            rowId: entry.rowId,
            reason,
            at: Date.now(),
          });
        }
      }
      await db.outbox.bulkDelete(batch.map((entry) => entry.seq!));
    });
  }
}
