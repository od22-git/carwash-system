/**
 * Tables that sync with the server. Must match the names the API registers.
 * Add one line here when a feature adds a synced table.
 */
export const SYNCED_TABLES = [
  'settings',
  'customers',
  'vehicles',
  'services',
  'servicePrices',
  'workers',
] as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];

export const isSyncedTable = (name: string): name is SyncedTable =>
  (SYNCED_TABLES as readonly string[]).includes(name);
