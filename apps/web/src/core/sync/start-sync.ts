import { onLocalChange } from './local-changes';
import { runSync } from './run-sync';

const INTERVAL_MS = 30_000;
const AFTER_SAVE_DELAY_MS = 1_000;

/**
 * Keeps the laptop in sync: on start, every 30 s, when the internet comes back,
 * and shortly after each save. Returns a stop function.
 */
export function startSync(): () => void {
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  const sync = () => void runSync();
  const syncSoon = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(sync, AFTER_SAVE_DELAY_MS);
  };

  sync();
  const interval = setInterval(sync, INTERVAL_MS);
  window.addEventListener('online', sync);
  const stopListening = onLocalChange(syncSoon);

  return () => {
    clearInterval(interval);
    clearTimeout(saveTimer);
    window.removeEventListener('online', sync);
    stopListening();
  };
}
