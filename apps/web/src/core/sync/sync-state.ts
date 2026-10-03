import { useSyncExternalStore } from 'react';

export type SyncPhase = 'idle' | 'syncing' | 'offline' | 'login-expired' | 'error';

let phase: SyncPhase = 'idle';
const listeners = new Set<() => void>();

export function setSyncPhase(next: SyncPhase): void {
  if (next === phase) return;
  phase = next;
  listeners.forEach((listener) => listener());
}

export const getSyncPhase = () => phase;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSyncPhase(): SyncPhase {
  return useSyncExternalStore(subscribe, getSyncPhase);
}
