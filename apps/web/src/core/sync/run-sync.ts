import { ApiError, OfflineError } from '../api';
import { getMeta, setMeta } from '../db';
import { pullChanges } from './pull';
import { pushOutbox } from './push';
import { setSyncPhase, type SyncPhase } from './sync-state';

let running: Promise<void> | null = null;

function phaseFor(error: unknown): SyncPhase {
  if (error instanceof OfflineError) return 'offline';
  if (error instanceof ApiError && error.status === 401) return 'login-expired';
  return 'error';
}

async function syncOnce(): Promise<void> {
  const [session, device] = await Promise.all([getMeta('session'), getMeta('device')]);
  if (!session || !device) return;

  setSyncPhase('syncing');
  try {
    await pushOutbox();
    await pullChanges();
    await setMeta('lastSyncAt', Date.now());
    setSyncPhase('idle');
  } catch (error) {
    setSyncPhase(phaseFor(error));
  }
}

/** Push then pull. Calls made while a sync is running share that run. */
export function runSync(): Promise<void> {
  running ??= syncOnce().finally(() => {
    running = null;
  });
  return running;
}
