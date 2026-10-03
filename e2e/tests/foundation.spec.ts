import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { CASHIER, OWNER, expectAllSynced, login, status } from './support/helpers';
import { localSetting } from './support/local-db';
import { resetDatabase } from './support/reset-database';

/** Two browser contexts = the admin laptop and the reception laptop. */
test.describe.serial('milestone 1: setup, roles, offline work and sync', () => {
  let adminLaptop: BrowserContext;
  let receptionLaptop: BrowserContext;
  let admin: Page;
  let reception: Page;

  test.beforeAll(async ({ browser }) => {
    await resetDatabase();
    adminLaptop = await browser.newContext();
    receptionLaptop = await browser.newContext();
    admin = await adminLaptop.newPage();
    reception = await receptionLaptop.newPage();
  });

  test('a fresh install leads the owner to create the admin account', async () => {
    await admin.goto('/');
    await expect(admin).toHaveURL(/\/setup$/);
    await admin.getByLabel('الاسم').fill(OWNER.name);
    await admin.getByLabel('اسم المستخدم').fill(OWNER.username);
    await admin.getByLabel('كلمة المرور', { exact: true }).fill(OWNER.password);
    await admin.getByLabel('تأكيد كلمة المرور').fill(OWNER.password);
    await admin.getByRole('button', { name: 'إنشاء حساب المسؤول' }).click();
    await expect(admin.getByRole('heading', { name: 'الإعدادات' })).toBeVisible();
  });

  test('the admin sets the garage rate and creates the cashier account', async () => {
    await admin.getByLabel('سعر ساعة الكراج (ل.س)').fill('12000');
    await admin.getByRole('button', { name: 'حفظ إعدادات الكراج' }).click();
    await expect(admin.getByText('حُفظت إعدادات الكراج.')).toBeVisible();

    const form = admin.locator('form').filter({ hasText: 'نوع الحساب' });
    await form.getByLabel('الاسم').fill(CASHIER.name);
    await form.getByLabel('اسم المستخدم').fill(CASHIER.username);
    await form.getByLabel('كلمة المرور').fill(CASHIER.password);
    await form.getByRole('button', { name: 'إنشاء الحساب' }).click();
    await expect(admin.getByText('أُنشئ الحساب.')).toBeVisible();
    await expectAllSynced(admin);
  });

  test('the cashier sees only daily screens and receives the admin settings', async () => {
    await login(reception, CASHIER);
    await expect(reception).toHaveURL(/\/wash$/);
    const nav = reception.getByRole('navigation', { name: 'القائمة' });
    await expect(nav.getByRole('link', { name: 'الغسيل' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'الإعدادات' })).toHaveCount(0);

    await reception.goto('/settings');
    await expect(reception).toHaveURL(/\/wash$/);

    await expect.poll(() => localSetting(reception, 'garage')).toMatchObject({ hourlyRate: 12000 });
  });

  test('the admin keeps working without internet, and it syncs when back', async () => {
    await adminLaptop.setOffline(true);
    await expect(status(admin)).toContainText('بدون إنترنت');

    await admin.getByLabel('سعر ساعة الكراج (ل.س)').fill('15000');
    await admin.getByRole('button', { name: 'حفظ إعدادات الكراج' }).click();
    await expect(status(admin)).toContainText('1 بانتظار الرفع');

    await adminLaptop.setOffline(false);
    await expectAllSynced(admin);

    await reception.reload();
    await expect.poll(() => localSetting(reception, 'garage')).toMatchObject({ hourlyRate: 15000 });
  });

  test('the cashier can log in again without internet', async () => {
    await reception.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await expect(reception).toHaveURL(/\/login$/);
    await receptionLaptop.setOffline(true);
    await reception.getByLabel('اسم المستخدم').fill(CASHIER.username);
    await reception.getByLabel('كلمة المرور').fill(CASHIER.password);
    await reception.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(reception).toHaveURL(/\/wash$/);
    await expect(status(reception)).toContainText('بدون إنترنت');
  });

  test('a wrong password is refused offline too', async () => {
    await reception.getByRole('button', { name: 'تسجيل الخروج' }).click();
    await reception.getByLabel('اسم المستخدم').fill(CASHIER.username);
    await reception.getByLabel('كلمة المرور').fill('wrong-password');
    await reception.getByRole('button', { name: 'تسجيل الدخول' }).click();
    await expect(reception.getByRole('alert')).toContainText('لا يوجد اتصال بالإنترنت');
  });
});
