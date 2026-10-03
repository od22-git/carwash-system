import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import {
  CASHIER,
  createCashier,
  expectAllSynced,
  login,
  nav,
  setupOwner,
  status,
} from './support/helpers';
import { localRows } from './support/local-db';
import { resetDatabase } from './support/reset-database';

const FIRST_SERVICE = 'داخلي وخارجي معاً';

test.describe.serial('milestone 2: services, workers, customers and cars', () => {
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
    await setupOwner(admin);
    await createCashier(admin);
  });

  test('the admin starts from the nine services and sets a price', async () => {
    await nav(admin).getByRole('link', { name: 'الخدمات والأسعار' }).click();
    await admin.getByRole('button', { name: 'إضافة الخدمات الأساسية' }).click();
    await expect(admin.getByLabel('اسم الخدمة')).toHaveCount(9);

    const cell = admin.getByLabel(`سعر ${FIRST_SERVICE} لسيارة سيدان`);
    await cell.fill('٢٥٠٠٠');
    await cell.press('Enter');
    await expect(cell).toHaveValue('25,000');
    await admin.reload();
    await expect(admin.getByLabel(`سعر ${FIRST_SERVICE} لسيارة سيدان`)).toHaveValue('25,000');
  });

  test('the admin adds a worker paid by commission', async () => {
    await nav(admin).getByRole('link', { name: 'العمال' }).click();
    await admin.getByRole('button', { name: 'عامل جديد' }).click();
    await admin.getByLabel('اسم العامل').fill('محمد');
    await admin.getByLabel('عمولة (نسبة من سعر الغسلة)').check();
    await admin.getByLabel('نسبة العمولة من سعر الغسلة (%)').fill('30');
    await admin.getByRole('button', { name: 'إضافة العامل' }).click();
    await expect(admin.getByRole('cell', { name: 'عمولة 30% من سعر الغسلة' })).toBeVisible();
    await expectAllSynced(admin);
  });

  test('the cashier gets prices and worker names, never worker pay', async () => {
    await login(reception, CASHIER);
    await expect(reception).toHaveURL(/\/wash$/);
    await expect(nav(reception).getByRole('link', { name: 'العمال' })).toHaveCount(0);
    await expect.poll(async () => (await localRows(reception, 'servicePrices')).length).toBe(1);
    const workers = await localRows(reception, 'workers');
    expect(workers[0]).toMatchObject({ name: 'محمد' });
    expect(workers[0]).not.toHaveProperty('rate');
  });

  test('the cashier registers a customer with a car', async () => {
    await nav(reception).getByRole('link', { name: 'العملاء' }).click();
    await reception.getByRole('button', { name: 'عميل جديد' }).click();
    await reception.getByLabel('اسم العميل').fill('سامر الحلبي');
    await reception.getByLabel('رقم الهاتف (واتساب)').fill('0933 111 222');
    await reception.getByRole('button', { name: 'حفظ العميل' }).click();
    await expect(reception.getByText('رقم العميل B-0001')).toBeVisible();

    await reception.getByRole('button', { name: 'إضافة سيارة' }).click();
    await reception.getByLabel('رقم اللوحة').fill('حلب ١٢٣٤٥٦');
    await reception.getByLabel('اللون').fill('أبيض');
    await reception.getByText('جيب', { exact: true }).click();
    await reception.getByRole('button', { name: 'إضافة السيارة' }).click();
    await expect(reception.getByText('حلب 123456').first()).toBeVisible();
  });

  test('the same phone cannot become a second customer', async () => {
    await reception.getByRole('button', { name: 'عميل جديد' }).click();
    await reception.getByLabel('اسم العميل').fill('شخص آخر');
    await reception.getByLabel('رقم الهاتف (واتساب)').fill('+963933111222');
    await expect(reception.getByText('رقم الهاتف هذا مسجّل لعميل موجود')).toBeVisible();
    await expect(reception.getByRole('button', { name: 'حفظ العميل' })).toBeDisabled();
    await reception.getByRole('button', { name: 'فتح هذا العميل' }).click();
    await expect(reception.getByRole('heading', { name: 'سامر الحلبي' })).toBeVisible();
  });

  test('the cashier finds the customer by plate', async () => {
    await reception.getByLabel('بحث بالاسم أو الهاتف أو اللوحة أو رقم العميل').fill('123456');
    await expect(
      reception.getByRole('list', { name: 'نتائج البحث' }).getByRole('button'),
    ).toHaveCount(1);
  });

  test('a customer added offline reaches the admin when back online', async () => {
    await receptionLaptop.setOffline(true);
    await reception.getByRole('button', { name: 'عميل جديد' }).click();
    await reception.getByLabel('اسم العميل').fill('ليلى');
    await reception.getByLabel('رقم الهاتف (واتساب)').fill('0944555666');
    await reception.getByRole('button', { name: 'حفظ العميل' }).click();
    await expect(status(reception)).toContainText('بانتظار الرفع');

    await receptionLaptop.setOffline(false);
    await expectAllSynced(reception);
    await admin.goto('/customers');
    await expect(admin.getByRole('button', { name: /ليلى/ })).toBeVisible();
  });
});
