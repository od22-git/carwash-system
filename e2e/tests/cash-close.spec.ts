import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SERVICES, setUpCatalog } from './support/catalog-setup';
import { openCustomer, payDebt } from './support/customers';
import { CASHIER, createCashier, expectAllSynced, login, nav, setupOwner } from './support/helpers';
import { resetDatabase } from './support/reset-database';
import { card, registerWash } from './support/wash';

const today = (page: Page) => page.getByRole('region', { name: 'صندوق اليوم' });
const closed = (page: Page) => page.getByRole('article', { name: 'الصندوق مغلق' });

async function deliverWash(page: Page, car: { plate: string; phone: string; name: string }) {
  await registerWash(page, { ...car, services: [SERVICES.exterior], worker: 'محمد' });
  return card(page, car.plate);
}

test.describe.serial('milestone 6: the daily cash close', () => {
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
    await setUpCatalog(admin);
    await expectAllSynced(admin);
    await login(reception, CASHIER);
  });

  test('the day: one car paid, one on account, part of a debt paid', async () => {
    const paid = await deliverWash(reception, {
      plate: 'حلب 31',
      phone: '0933000031',
      name: 'هادي',
    });
    await paid.getByRole('button', { name: 'الزبون استلم مباشرة' }).click();
    const credit = await deliverWash(reception, {
      plate: 'حلب 32',
      phone: '0933000032',
      name: 'وسيم',
    });
    await credit.getByLabel('على الحساب (آجل)').check();
    await credit.getByRole('button', { name: 'الزبون استلم مباشرة' }).click();
    await openCustomer(reception, 'وسيم');
    await payDebt(reception, '10000');
  });

  test('the cashier counts the drawer: 5,000 short', async () => {
    await nav(reception).getByRole('link', { name: 'إغلاق الصندوق' }).click();
    // 25,000 wash paid now + 10,000 debt paid; the 25,000 on account is not in the drawer.
    await expect(today(reception)).toContainText('35,000 ل.س');
    await expect(today(reception)).toContainText('على الحساب (آجل) اليوم 25,000 ل.س');

    await reception.getByLabel('الفكة أول اليوم (ل.س)').fill('50000');
    await reception.getByLabel('المبلغ الموجود في الصندوق (ل.س)').fill('80000');
    await expect(today(reception)).toContainText('يجب أن يكون في الصندوق 85,000 ل.س');
    await expect(today(reception)).toContainText('عجز 5,000 ل.س');
    await reception.getByRole('button', { name: 'إغلاق الصندوق' }).click();

    await expect(closed(reception)).toContainText('أُغلق الصندوق: موظف الاستقبال');
    await expect(closed(reception).getByRole('button', { name: 'إعادة فتح اليوم' })).toHaveCount(0);
    await closed(reception).getByRole('button', { name: 'طباعة' }).click();
    await expect(reception.locator('.print-area')).toContainText('عجز 5,000 ل.س');
    await expectAllSynced(reception);
  });

  test('the admin sees the month, and reopens the day (logged)', async () => {
    await admin.goto('/cash');
    await expect(closed(admin)).toContainText('عجز 5,000 ل.س');
    const month = admin.getByRole('region', { name: 'إغلاقات الشهر' });
    await expect(month.getByRole('row', { name: /موظف الاستقبال/ })).toContainText('عجز 5,000');

    await closed(admin).getByRole('button', { name: 'إعادة فتح اليوم' }).click();
    await expect(admin.getByRole('button', { name: 'إغلاق الصندوق' })).toBeVisible();
    await expectAllSynced(admin);
    await nav(admin).getByRole('link', { name: 'الحسابات والتقارير' }).click();
    await expect(admin.getByRole('region', { name: 'سجل العمليات الحساسة' })).toContainText(
      'إعادة فتح الصندوق',
    );
  });

  test('the cashier counts again and closes the day', async () => {
    await reception.goto('/cash');
    await reception.getByLabel('الفكة أول اليوم (ل.س)').fill('50000');
    await reception.getByLabel('المبلغ الموجود في الصندوق (ل.س)').fill('85,000');
    await expect(today(reception)).toContainText('مطابق');
    await reception.getByRole('button', { name: 'إغلاق الصندوق' }).click();
    await expect(closed(reception)).toContainText('مطابق');
    await expectAllSynced(reception);
  });
});
