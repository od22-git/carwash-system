import { Inject, Injectable } from '@nestjs/common';
import { asc, gt, inArray, sql } from 'drizzle-orm';
import { DB, type Database } from '../../database';
import { changeLog, type ChangeLogRow } from './change-log.schema';
import type { SyncEntry, WireRow } from './sync-entry';

@Injectable()
export class SyncRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  /**
   * Last write wins: the row is saved only when it is not older than the server's copy.
   * Returns false when the server already had a newer version (nothing changed).
   */
  upsert(entry: SyncEntry, row: WireRow): Promise<boolean> {
    const { table } = entry;
    const { id: _id, ...changes } = row;
    return this.db.transaction(async (tx) => {
      // Rows are validated by the entry's zod schema before reaching here.
      const saved = await tx
        .insert(table)
        .values(row as never)
        .onConflictDoUpdate({
          target: table.id,
          set: changes as never,
          where: sql`${table.updatedAt} <= excluded.updated_at`,
        })
        .returning({ id: table.id });
      if (saved.length === 0) return false;
      await tx.insert(changeLog).values({ tableName: entry.name, rowId: String(row.id) });
      return true;
    });
  }

  readChanges(since: number, limit: number): Promise<ChangeLogRow[]> {
    return this.db
      .select({ seq: changeLog.seq, tableName: changeLog.tableName, rowId: changeLog.rowId })
      .from(changeLog)
      .where(gt(changeLog.seq, since))
      .orderBy(asc(changeLog.seq))
      .limit(limit);
  }

  async loadRows(entry: SyncEntry, ids: string[]): Promise<WireRow[]> {
    const rows = await this.db.select().from(entry.table).where(inArray(entry.table.id, ids));
    return rows as WireRow[];
  }

  async findById(entry: SyncEntry, id: string): Promise<WireRow | undefined> {
    const [row] = await this.loadRows(entry, [id]);
    return row;
  }
}
