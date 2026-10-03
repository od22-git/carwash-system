import type { DeviceInfo, LoginResponse } from '@carwash/shared';
import { useLiveQuery } from 'dexie-react-hooks';
import type { OfflineCredential } from '../auth/offline-credential';
import { db } from './local-db';

/** Small key/value facts about this laptop. */
export interface MetaMap {
  /** The logged-in session; removed on logout. */
  session: LoginResponse;
  /** Past logins on this laptop, for logging in again without internet. */
  credentials: Record<string, { credential: OfflineCredential; session: LoginResponse }>;
  device: DeviceInfo;
  syncCursor: number;
  lastSyncAt: number;
}

export type MetaKey = keyof MetaMap;

export async function getMeta<K extends MetaKey>(key: K): Promise<MetaMap[K] | undefined> {
  const entry = await db.meta.get(key);
  return entry?.value as MetaMap[K] | undefined;
}

export async function setMeta<K extends MetaKey>(key: K, value: MetaMap[K]): Promise<void> {
  await db.meta.put({ key, value });
}

export async function deleteMeta(key: MetaKey): Promise<void> {
  await db.meta.delete(key);
}

/**
 * Live value for React. `undefined` while loading, `null` when not set.
 */
export function useMeta<K extends MetaKey>(key: K): MetaMap[K] | null | undefined {
  return useLiveQuery(async () => (await getMeta(key)) ?? null, [key]);
}
