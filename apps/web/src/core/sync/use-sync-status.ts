import { useLiveQuery } from 'dexie-react-hooks';
import { db, useMeta } from '../db';
import { useOnline } from '../network';
import { useSyncPhase, type SyncPhase } from './sync-state';

export interface SyncStatus {
  phase: SyncPhase;
  online: boolean;
  /** Changes saved on this laptop and not yet on the server. */
  pending: number;
  /** Changes the server refused (shown to the admin). */
  failed: number;
  lastSyncAt: number | null;
}

export function useSyncStatus(): SyncStatus {
  const phase = useSyncPhase();
  const online = useOnline();
  const pending = useLiveQuery(() => db.outbox.count(), [], 0);
  const failed = useLiveQuery(() => db.syncErrors.count(), [], 0);
  const lastSyncAt = useMeta('lastSyncAt') ?? null;
  return { phase: online ? phase : 'offline', online, pending, failed, lastSyncAt };
}
