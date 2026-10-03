import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { CASHIER, createCashier, expectAllSynced, login, nav, setupOwner } from './support/helpers';
import { localRows } from './support/local-db';
import { resetDatabase } from './support/reset-database';
import { addProduct, buy, count, goTo, stockRow } from './support/stock';

const WATER = {
  name: 'مياه',
  kind: 'البوفيه',
  barcode: '6281000001',
  retailPrice: '3000',
  minQty: '5',
} as const;
const OIL = {
  name: 'زيت محرك',
  kind: 'منتجات السيارات',
  unitsPerCarton: '12',
  retailPrice: '60000',
  wholesalePrice: '650000',
  minQty: '6',
} as const;

const cart = (page: Page) => page.getByRole('region', { name: 'السلة' });
const salesToday = (page: Page) => page.getByRole('region', { name: 'مبيعات اليوم' });

test.describe.serial('milestone 5: stock, sales and waste', () => {
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
    await reception.addInitScript(() => (window.print = () => undefined));
    await setupOwner(admin);
    await createCashier(admin);
  });

  test('the admin adds products to the three stocks and buys them', async () => {
    await goTo(admin, 'المخزون والبوفيه');
    await addProduct(admin, 'صنف جديد', WATER);
    await addProduct(admin, 'صنف جديد', OIL);
    await buy(admin, { product: OIL.name, quantity: '2', price: '500000' });
    await buy(admin, { product: WATER.name, quantity: '24', price: '2000' });
    await expect(stockRow(admin, OIL.name)).toContainText('2 كرتونة');
    await expect(stockRow(admin, WATER.name)).toContainText('24 قطعة');

    await goTo(admin, 'مواد الهدر');
    await addProduct(admin, 'مادة جديدة', { name: 'شامبو', unit: 'لتر', minQty: '2' });
    await buy(admin, { product: 'شامبو', quantity: '20', price: '10000' });
    await expect(stockRow(admin, 'شامبو')).toContainText('20 لتر');
    await expectAllSynced(admin);
  });

  test('the cashier scans a barcode, sells a carton, and gets a receipt', async () => {
    await login(reception, CASHIER);
    await expect(nav(reception).getByRole('link', { name: 'مواد الهدر' })).toHaveCount(0);
    await goTo(reception, 'البيع والبوفيه');
    const scan = reception.getByLabel('امسح الباركود أو ابحث بالاسم');
    for (let i = 0; i < 2; i++) {
      await scan.fill(WATER.barcode);
      await scan.press('Enter');
    }
    await reception
      .getByRole('region', { name: 'منتجات السيارات' })
      .getByRole('button', { name: /زيت محرك/ })
      .click();
    await cart(reception).getByLabel('طريقة البيع: زيت محرك').selectOption({ label: 'كرتونة' });
    await expect(cart(reception).getByLabel('الكمية: مياه')).toHaveValue('2');
    await cart(reception).getByRole('button', { name: 'إتمام البيع (656,000 ل.س)' }).click();
    await expect(cart(reception)).toContainText('تم البيع، الإيصال B-000001.');
    await expect(salesToday(reception)).toContainText('الدخل 656,000 ل.س');
  });

  test('the cashier never receives purchases or stock levels', async () => {
    expect(await localRows(reception, 'stockMovements')).toEqual([]);
    await reception.goto('/stock');
    await expect(reception).toHaveURL(/\/wash$/);
  });

  test('a sale made offline reaches the admin and comes off the stock', async () => {
    await goTo(reception, 'البيع والبوفيه');
    await receptionLaptop.setOffline(true);
    await reception
      .getByRole('region', { name: 'البوفيه' })
      .getByRole('button', { name: /مياه/ })
      .click();
    await cart(reception).getByRole('button', { name: 'إتمام البيع (3,000 ل.س)' }).click();
    await expect(cart(reception)).toContainText('B-000002');
    await receptionLaptop.setOffline(false);
    await expectAllSynced(reception);

    // Opening the app pulls right away (otherwise it pulls within 30 seconds).
    await admin.goto('/stock');
    await expect(stockRow(admin, OIL.name)).toContainText('1 كرتونة');
    await expect(stockRow(admin, WATER.name)).toContainText('21 قطعة');
  });

  test('the evening count turns the missing shampoo into the day’s waste', async () => {
    await goTo(admin, 'مواد الهدر');
    const panel = await count(admin, 'الجرد المسائي', 'الجرد المسائي', { شامبو: '17' });
    await expect(panel.getByText('حُفظ جرد 1 صنف. الهدر: 30,000 ل.س.')).toBeVisible();
    await panel.getByRole('button', { name: 'إغلاق' }).click();
    const today = admin.getByRole('region', { name: 'هدر اليوم' });
    await expect(today.getByRole('row', { name: /شامبو/ })).toContainText('17');
    await expect(today).toContainText('30,000 ل.س');
  });

  test('a stock count below the minimum raises the alert in the menu', async () => {
    await goTo(admin, 'المخزون والبوفيه');
    const panel = await count(admin, 'جرد', 'جرد المخزون', { [WATER.name]: '4' });
    await expect(panel.getByText('الفقد: 34,000 ل.س.')).toBeVisible();
    await panel.getByRole('button', { name: 'إغلاق' }).click();
    await expect(admin.getByText('قارب على النفاد: مياه')).toBeVisible();
    await expect(nav(admin).getByRole('link', { name: /المخزون والبوفيه.*1 ناقص/ })).toBeVisible();
  });

  test('the admin cancels a sale: its items return to stock, and it is logged', async () => {
    await goTo(admin, 'البيع والبوفيه');
    const row = salesToday(admin).getByRole('row', { name: /B-000001/ });
    await row.getByRole('button', { name: 'إلغاء الإيصال' }).click();
    await salesToday(admin).getByRole('button', { name: 'تأكيد إلغاء الإيصال' }).click();
    await expect(row).toContainText('ملغى');
    const events = await localRows(admin, 'auditEvents');
    expect(events.map((e) => e.action)).toContain('sale.cancel');

    await goTo(admin, 'المخزون والبوفيه');
    await expect(stockRow(admin, OIL.name)).toContainText('2 كرتونة');
    await expect(stockRow(admin, WATER.name)).toContainText('6 قطعة');
    await expect(admin.getByText('قارب على النفاد')).toHaveCount(0);
    const report = admin.getByRole('region', { name: 'التقرير الشهري' });
    await expect(report.getByRole('row', { name: /المجموع/ })).toContainText('1,048,000 ل.س');
    await expectAllSynced(admin);
  });
});
