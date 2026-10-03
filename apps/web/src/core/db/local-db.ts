import type { SettingRecord, SyncRecord } from '@carwash/shared';
import Dexie, { type EntityTable } from 'dexie';

/** Any synced row as stored on the laptop. */
export type LocalRecord = SyncRecord & Record<string, unknown>;

export interface OutboxEntry {
  seq?: number;
  table: string;
  rowId: string;
  row: LocalRecord;
  queuedAt: number;
}

export interface SyncErrorEntry {
  id?: number;
  table: string;
  rowId: string;
  reason: string;
  at: number;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

/**
 * The laptop's own database. Screens read only from here, so the app works the same
 * with or without internet. Feature tables are added with a new version() line.
 */
export class LocalDb extends Dexie {
  meta!: EntityTable<MetaEntry, 'key'>;
  outbox!: EntityTable<OutboxEntry, 'seq'>;
  syncErrors!: EntityTable<SyncErrorEntry, 'id'>;
  settings!: EntityTable<SettingRecord, 'id'>;

  constructor(name = 'carwash') {
    super(name);
    this.version(1).stores({
      meta: 'key',
      outbox: '++seq, table, [table+rowId]',
      syncErrors: '++id',
      settings: 'id',
    });
  }
}

export const db = new LocalDb();
