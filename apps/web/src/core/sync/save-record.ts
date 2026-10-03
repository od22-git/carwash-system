import { db, getMeta, type LocalRecord, type SyncedTable } from '../db';
import { notifyLocalChange } from './local-changes';

type Draft = Record<string, unknown> & { id?: string; deletedAt?: number | null };

/**
 * The only way features write data. Saves on this laptop and queues the change for the server,
 * in one transaction, so nothing is lost if the internet or the power goes.
 */
export async function saveRecord(table: SyncedTable, draft: Draft): Promise<LocalRecord> {
  const device = await getMeta('device');
  if (!device) throw new Error('This laptop is not registered yet. Log in once with internet.');

  const store = db.table<LocalRecord, string>(table);
  const row = await db.transaction('rw', store, db.outbox, async () => {
    const existing = draft.id ? await store.get(draft.id) : undefined;
    const now = Date.now();
    const next: LocalRecord = {
      ...existing,
      ...draft,
      id: draft.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      // Always newer than the previous version, even if the laptop clock went backwards.
      updatedAt: Math.max(now, (existing?.updatedAt ?? 0) + 1),
      deviceId: device.id,
      deletedAt: draft.deletedAt ?? existing?.deletedAt ?? null,
    };
    await store.put(next);
    // Only the latest version of a row needs to be sent.
    await db.outbox.where('[table+rowId]').equals([table, next.id]).delete();
    await db.outbox.add({ table, rowId: next.id, row: next, queuedAt: now });
    return next;
  });

  notifyLocalChange();
  return row;
}

/** Soft delete: the row stays (so the delete can sync) but is hidden from screens. */
export const deleteRecord = (table: SyncedTable, id: string) =>
  saveRecord(table, { id, deletedAt: Date.now() });
