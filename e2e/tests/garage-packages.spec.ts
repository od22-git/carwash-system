import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SERVICES, setUpCatalog } from './support/catalog-setup';
import {
  garageToday,
  parkCar,
  parkedCard,
  runningPackages,
  sellPackage,
  setUpGarageOffers,
} from './support/garage';
import { CASHIER, createCashier, expectAllSynced, login, nav, setupOwner } from './support/helpers';
import { localRows } from './support/local-db';
import { resetDatabase } from './support/reset-database';
import { card, registerWash } from './support/wash';

/**
 * The cashier's laptop runs on "yesterday 08:00" so fast-forwarding hours never crosses
 * midnight, and its changes are always older than the admin's (who uses the real clock).
 */
function yesterdayAt8() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(8, 0, 0, 0);
  return d;
}

const SUBSCRIBER = { plate: 'حمص 202', phone: '0944000202', name: 'هالة' };

test.describe.serial('milestone 4: garage and packages', () => {
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
    await reception.clock.install({ time: yesterdayAt8() });
    await reception.addInitScript(() => (window.print = () => undefined));
    await setupOwner(admin);
    await createCashier(admin);
    await setUpCatalog(admin);
    await setUpGarageOffers(admin);
    await expectAllSynced(admin);
    await login(reception, CASHIER);
    await expect(reception).toHaveURL(/\/wash$/);
    await nav(reception).getByRole('link', { name: 'الكراج', exact: true }).click();
  });

  test('by the hour: 1 h 20 min in the garage pays two started hours', async () => {
    await parkCar(reception, { plate: 'حلب 101', phone: '0933000101', name: 'باسل' });
    await reception.clock.fastForward('01:20:00');
    await parkedCard(reception, 'حلب 101')
      .getByRole('button', { name: 'خروج السيارة (20,000 ل.س)' })
      .click();
    await expect(garageToday(reception)).toContainText('كراج: بالساعة');
    await expect(garageToday(reception)).toContainText('20,000 ل.س');
  });

  test('a day plan is charged its fixed price', async () => {
    await parkCar(reception, { plate: 'دمشق 303', phone: '0955000303', name: 'رنا', plan: 'يوم' });
    const car = parkedCard(reception, 'دمشق 303');
    await expect(car).toContainText('يوم (24 ساعة)');
    await expect(car.getByRole('button', { name: 'خروج السيارة (150,000 ل.س)' })).toBeVisible();
  });

  test('the cashier sells a monthly package for a car', async () => {
    await sellPackage(reception, SUBSCRIBER, 'شهري');
    await expect(reception.locator('.print-area')).toContainText('غسلات مجانية');
    const row = runningPackages(reception).getByRole('row', { name: /حمص 202/ });
    await expect(row).toContainText('4 من 4');
    await expect(row).toContainText('مشمول');
  });

  test('the package covers the garage: hours later the car leaves for free', async () => {
    await parkCar(reception, { plate: SUBSCRIBER.plate });
    const car = parkedCard(reception, SUBSCRIBER.plate);
    await expect(car).toContainText('مشمول بالباقة');
    await reception.clock.fastForward('03:00:00');
    await car.getByRole('button', { name: 'خروج السيارة (0 ل.س)' }).click();
    await expect(car).toHaveCount(0);
  });

  test('a free wash from the package: only the extra service is paid', async () => {
    await nav(reception).getByRole('link', { name: 'الغسيل' }).click();
    await registerWash(reception, {
      plate: SUBSCRIBER.plate,
      services: [SERVICES.exterior, SERVICES.underbody],
      worker: 'محمد',
    });
    await card(reception, SUBSCRIBER.plate)
      .getByRole('button', { name: 'الزبون استلم مباشرة' })
      .click();
    await expect(reception.getByRole('region', { name: 'سُلّمت اليوم' })).toContainText(
      '20,000 ل.س',
    );
    await nav(reception).getByRole('link', { name: 'الكراج', exact: true }).click();
    await expect(runningPackages(reception).getByRole('row', { name: /حمص 202/ })).toContainText(
      '3 من 4',
    );
  });

  test('the admin sees it all, and cancels a garage receipt (logged)', async () => {
    await expectAllSynced(reception);
    await admin.goto('/garage');
    await expect(runningPackages(admin)).toContainText('3 من 4');
    const car = parkedCard(admin, 'دمشق 303');
    await car.getByRole('button', { name: 'إلغاء الإيصال' }).click();
    await car.getByLabel('سبب الإلغاء (اختياري)').fill('خرجت دون دفع');
    await car.getByRole('button', { name: 'تأكيد إلغاء الإيصال' }).click();
    await expect(car).toHaveCount(0);
    const events = await localRows(admin, 'auditEvents');
    expect(events[0]).toMatchObject({ action: 'parking.cancel', reason: 'خرجت دون دفع' });
    await expectAllSynced(admin);
  });
});
