import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SERVICES, setUpCatalog } from './support/catalog-setup';
import {
  CASHIER,
  createCashier,
  expectAllSynced,
  login,
  setupOwner,
  status,
} from './support/helpers';
import { localRows } from './support/local-db';
import { resetDatabase } from './support/reset-database';
import { card, column, registerWash } from './support/wash';

const BOTH = [SERVICES.exterior, SERVICES.underbody]; // 25,000 + 20,000 for a sedan

test.describe.serial('milestone 3: the wash flow', () => {
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
    // The laptop's clock is controlled, to test a customer who comes hours late.
    await reception.clock.install();
    await reception.addInitScript(() => (window.print = () => undefined));
    await setupOwner(admin);
    await createCashier(admin);
    await setUpCatalog(admin);
    await expectAllSynced(admin);
    await login(reception, CASHIER);
    await expect(reception).toHaveURL(/\/wash$/);
  });

  test('a new car is registered and goes straight to washing', async () => {
    await registerWash(reception, {
      plate: 'حلب 555',
      phone: '0933111222',
      name: 'سامر',
      services: BOTH,
      worker: 'محمد',
    });
    await expect(column(reception, 'قيد الغسيل').getByRole('article')).toHaveCount(1);
    await expect(card(reception, 'حلب 555')).toContainText('العامل: محمد');
  });

  test('a customer who asks for the busy worker waits for him', async () => {
    await registerWash(reception, {
      plate: 'دمشق 777',
      phone: '0944555666',
      name: 'ليلى',
      services: [SERVICES.exterior],
      worker: 'محمد',
      requested: true,
    });
    await expect(column(reception, 'بانتظار').getByRole('article')).toHaveCount(1);
    await expect(card(reception, 'دمشق 777')).toContainText('(بطلب الزبون)');
  });

  test('the WhatsApp notice links to the customer and starts the pickup countdown', async () => {
    const car = card(reception, 'حلب 555');
    await expect(car.getByRole('link', { name: 'تبليغ عبر واتساب' })).toHaveAttribute(
      'href',
      /wa\.me\/963933111222\?text=/,
    );
    await car.getByRole('button', { name: 'أُبلغ بطريقة أخرى' }).click();
    await expect(column(reception, 'في الكراج (مهلة الاستلام)').getByRole('article')).toHaveCount(
      1,
    );
    await expect(card(reception, 'حلب 555')).toContainText('مهلة الاستلام: 15:00');
  });

  test('picked up within the grace period: only the wash is paid', async () => {
    await card(reception, 'حلب 555')
      .getByRole('button', { name: 'تسليم السيارة (45,000 ل.س)' })
      .click();
    const today = reception.getByRole('region', { name: 'سُلّمت اليوم' });
    await expect(today).toContainText('45,000 ل.س');
  });

  test('picked up 4 hours late: the garage fee is added', async () => {
    const car = card(reception, 'دمشق 777');
    await car.getByRole('button', { name: 'بدء الغسيل' }).click();
    await car.getByRole('button', { name: 'أُبلغ بطريقة أخرى' }).click();
    // 4 h 14 m after the notice = 3 h 59 m after the 15 min grace -> 4 started hours.
    await reception.clock.fastForward('04:14:00');
    await expect(car).toContainText('انتهت المهلة. رسوم الكراج حتى الآن 40,000 ل.س');
    await car.getByRole('button', { name: 'تسليم السيارة (65,000 ل.س)' }).click();
    await expect(reception.getByRole('region', { name: 'سُلّمت اليوم' })).toContainText(
      '65,000 ل.س',
    );
  });

  test('the receipt is printed with the plate and total', async () => {
    const row = reception.getByRole('row', { name: /دمشق 777/ });
    await row.getByRole('button', { name: 'طباعة الإيصال' }).click();
    const receipt = reception.locator('.print-area');
    await expect(receipt).toContainText('دمشق 777');
    await expect(receipt).toContainText('الكراج (4 ساعة)');
    await expect(receipt).toContainText('65,000 ل.س');
  });

  test('the cashier has no cancel button; the admin cancels and it is logged', async () => {
    await expect(reception.getByRole('button', { name: 'إلغاء الإيصال' })).toHaveCount(0);
    await expectAllSynced(reception);

    await admin.goto('/wash');
    const row = admin.getByRole('row', { name: /حلب 555/ });
    await row.getByRole('button', { name: 'إلغاء الإيصال' }).click();
    await admin.getByLabel('سبب الإلغاء (اختياري)').fill('تسجيل مكرر');
    await admin.getByRole('button', { name: 'تأكيد إلغاء الإيصال' }).click();
    await expect(admin.getByRole('row', { name: /حلب 555/ })).toContainText('ملغاة');
    const events = await localRows(admin, 'auditEvents');
    expect(events[0]).toMatchObject({ action: 'ticket.cancel', reason: 'تسجيل مكرر' });
  });

  test('a car registered offline reaches the admin board when back online', async () => {
    await receptionLaptop.setOffline(true);
    await registerWash(reception, {
      plate: 'حمص 31',
      phone: '0955000111',
      name: 'رامي',
      services: [SERVICES.underbody],
      worker: 'علي',
    });
    await expect(status(reception)).toContainText('بانتظار الرفع');
    await receptionLaptop.setOffline(false);
    await expectAllSynced(reception);
    await admin.reload();
    await expect(card(admin, 'حمص 31')).toBeVisible();
  });
});
