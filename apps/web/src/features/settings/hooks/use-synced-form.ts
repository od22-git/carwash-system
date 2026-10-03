import { useState } from 'react';

/**
 * Form state that follows the saved setting: when a newer version arrives (saved here or
 * synced from the other laptop) the fields update, without remounting the form, so
 * messages like "saved" stay on screen.
 */
export function useSyncedForm<T>(saved: T, version: number) {
  const [form, setForm] = useState(saved);
  const [seenVersion, setSeenVersion] = useState(version);
  if (version !== seenVersion) {
    setSeenVersion(version);
    setForm(saved);
  }
  return [form, setForm] as const;
}
