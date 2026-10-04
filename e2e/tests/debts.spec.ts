import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SERVICES, setUpCatalog } from './support/catalog-setup';
import { CASHIER, createCashier, expectAllSynced, login, nav, setupOwner } from './support/helpers';
import { resetDatabase } from './support/reset-database';
import { card, registerWash } from './support/wash';

const PLATE = 'حلب 21';
const delivered = (page: Page) => page.getByRole('region', { name: 'سُلّمت اليوم' });
const account = (page: Page) => page.getByRole('region', { name: 'الحساب الآجل' });

async function openCustomer(page: Page, name: string) {
  await nav(page).getByRole('link', { name: 'العملاء' }).click();
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

test.describe.serial('milestone 6: customer debts (آجل)', () => {
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

  test('a car paid now and a car taken on the customer account', async () => {
    const car = { plate: PLATE, phone: '0933000021', name: 'خالد', worker: 'محمد' };
    await registerWash(reception, { ...car, services: [SERVICES.exterior] });
    await card(reception, PLATE).getByRole('button', { name: 'الزبون استلم مباشرة' }).click();

    await registerWash(reception, {
      plate: PLATE,
      services: [SERVICES.exterior, SERVICES.underbody],
      worker: 'علي',
    });
    await card(reception, PLATE).getByLabel('على الحساب (آجل)').check();
    await card(reception, PLATE).getByRole('button', { name: 'الزبون استلم مباشرة' }).click();

    const onAccount = delivered(reception).getByRole('row').filter({ hasText: 'آجل' });
    await expect(onAccount).toHaveCount(1);
    await expect(onAccount).toContainText('45,000 ل.س');
    await onAccount.getByRole('button', { name: 'طباعة الإيصال' }).click();
    await expect(reception.locator('.print-area')).toContainText('على الحساب (آجل)');
  });

  test('the customer pays part of it; the cashier prints the payment', async () => {
    await openCustomer(reception, 'خالد');
    await expect(account(reception)).toContainText('المستحق 45,000 ل.س');
    await expect(account(reception).getByLabel('المبلغ المدفوع (ل.س)')).toHaveValue('45,000');

    await account(reception).getByLabel('المبلغ المدفوع (ل.س)').fill('20000');
    await account(reception).getByRole('button', { name: 'تسجيل الدفعة' }).click();
    await expect(account(reception)).toContainText('سُجّلت الدفعة، الإيصال');
    await expect(account(reception)).toContainText('المستحق 25,000 ل.س');
    await expect(account(reception).getByLabel('المبلغ المدفوع (ل.س)')).toHaveValue('25,000');

    const payment = account(reception).getByRole('row', { name: /20,000/ });
    await payment.getByRole('button', { name: 'طباعة الإيصال' }).click();
    await expect(reception.locator('.print-area')).toContainText('دفعة من الحساب (آجل)');
    await expect(payment.getByRole('button', { name: 'حذف' })).toHaveCount(0);
    await expectAllSynced(reception);
  });

  test('the admin sees who owes, and removes a wrong payment (logged)', async () => {
    await admin.goto('/finance');
    const debtors = admin.getByRole('region', { name: 'ديون العملاء' });
    await expect(debtors.getByRole('row', { name: /خالد/ })).toContainText('25,000 ل.س');

    await openCustomer(admin, 'خالد');
    await account(admin)
      .getByRole('row', { name: /20,000/ })
      .getByRole('button', { name: 'حذف' })
      .click();
    await expect(account(admin)).toContainText('المستحق 45,000 ل.س');

    await nav(admin).getByRole('link', { name: 'الحسابات والتقارير' }).click();
    await expect(admin.getByRole('region', { name: 'سجل العمليات الحساسة' })).toContainText(
      'حذف دفعة دين',
    );
    await expectAllSynced(admin);
  });
});
