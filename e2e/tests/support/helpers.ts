import { expect, type Page } from '@playwright/test';

export const OWNER = { name: 'صاحب المغسلة', username: 'owner', password: 'secret123' };
export const CASHIER = { name: 'موظف الاستقبال', username: 'cashier', password: 'secret456' };

export async function login(page: Page, user: { username: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('اسم المستخدم').fill(user.username);
  await page.getByLabel('كلمة المرور').fill(user.password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
}

/** First run on a fresh database: the owner creates the admin account. */
export async function setupOwner(page: Page) {
  await page.goto('/setup');
  await page.getByLabel('الاسم').fill(OWNER.name);
  await page.getByLabel('اسم المستخدم').fill(OWNER.username);
  await page.getByLabel('كلمة المرور', { exact: true }).fill(OWNER.password);
  await page.getByLabel('تأكيد كلمة المرور').fill(OWNER.password);
  await page.getByRole('button', { name: 'إنشاء حساب المسؤول' }).click();
  await expect(page.getByRole('heading', { name: 'الإعدادات' })).toBeVisible();
}

/** The admin creates the cashier's account from the settings screen. */
export async function createCashier(admin: Page) {
  await admin.goto('/settings');
  const form = admin.locator('form').filter({ hasText: 'نوع الحساب' });
  await form.getByLabel('الاسم').fill(CASHIER.name);
  await form.getByLabel('اسم المستخدم').fill(CASHIER.username);
  await form.getByLabel('كلمة المرور').fill(CASHIER.password);
  await form.getByRole('button', { name: 'إنشاء الحساب' }).click();
  await expect(admin.getByText('أُنشئ الحساب.')).toBeVisible();
}

export const status = (page: Page) => page.getByRole('status').first();

export async function expectAllSynced(page: Page) {
  await expect(status(page)).toContainText('كل العمليات محفوظة على الخادم');
}

export const nav = (page: Page) => page.getByRole('navigation', { name: 'القائمة' });
