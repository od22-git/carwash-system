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
  'tickets',
  'auditEvents',
  'parkingPlans',
  'parkingSessions',
  'packages',
  'subscriptions',
  'products',
  'stockMovements',
  'sales',
  'workerPayments',
  'expenses',
  'budgets',
] as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];

export const isSyncedTable = (name: string): name is SyncedTable =>
  (SYNCED_TABLES as readonly string[]).includes(name);
