import { expect, type Page } from '@playwright/test';

export const OWNER = { name: 'صاحب المغسلة', username: 'owner', password: 'secret123' };
export const CASHIER = { name: 'موظف الاستقبال', username: 'cashier', password: 'secret456' };

export async function login(page: Page, user: { username: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('اسم المستخدم').fill(user.username);
  await page.getByLabel('كلمة المرور').fill(user.password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
}

/** Reads a setting straight from the laptop's own database (IndexedDB). */
export function localSetting(page: Page, key: string) {
  return page.evaluate(
    (id) =>
      new Promise<unknown>((resolve, reject) => {
        const open = indexedDB.open('carwash');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const get = open.result.transaction('settings').objectStore('settings').get(id);
          get.onsuccess = () => resolve(get.result?.value ?? null);
          get.onerror = () => reject(get.error);
        };
      }),
    key,
  );
}

export const status = (page: Page) => page.getByRole('status').first();

export async function expectAllSynced(page: Page) {
  await expect(status(page)).toContainText('كل العمليات محفوظة على الخادم');
}
