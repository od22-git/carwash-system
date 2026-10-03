import { useLiveQuery } from 'dexie-react-hooks';

/**
 * Live rows from the laptop database without soft-deleted ones.
 * `undefined` while loading.
 */
export function useActiveRows<T extends { deletedAt: number | null }>(
  query: () => Promise<T[]>,
  deps: unknown[] = [],
): T[] | undefined {
  return useLiveQuery(async () => (await query()).filter((row) => !row.deletedAt), deps);
}
