import type { Page } from '@playwright/test';

/**
 * Reads rows straight from a laptop's own database (IndexedDB), to check what synced.
 * Never creates the database and always closes its connection, so it cannot block the
 * app's own database from opening or upgrading. Returns [] until the table exists.
 */
export function localRows(page: Page, table: string): Promise<Record<string, unknown>[]> {
  return page.evaluate(
    (name) =>
      new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const open = indexedDB.open('carwash');
        open.onupgradeneeded = () => open.transaction?.abort();
        open.onerror = () => resolve([]);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains(name)) {
            db.close();
            return resolve([]);
          }
          const all = db.transaction(name).objectStore(name).getAll();
          all.onsuccess = () => {
            db.close();
            resolve(all.result);
          };
          all.onerror = () => {
            db.close();
            reject(all.error);
          };
        };
      }),
    table,
  );
}

export async function localSetting(page: Page, key: string) {
  const rows = await localRows(page, 'settings');
  return rows.find((r) => r.id === key)?.value ?? null;
}
