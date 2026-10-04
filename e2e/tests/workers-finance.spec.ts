import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { SERVICES, setUpCatalog } from './support/catalog-setup';
import { CASHIER, createCashier, expectAllSynced, login, nav, setupOwner } from './support/helpers';
import { exportExcel, rowStarting, rowValues } from './support/excel';
import { resetDatabase } from './support/reset-database';
import { card, registerWash } from './support/wash';

const CARS = [
  // محمد: 30% commission. علي: 75,000 a day.
  {
    plate: 'حلب 11',
    phone: '0933000011',
    services: [SERVICES.exterior, SERVICES.underbody],
    worker: 'محمد',
  },
  { plate: 'حلب 12', phone: '0933000012', services: [SERVICES.exterior], worker: 'محمد' },
  { plate: 'حلب 13', phone: '0933000013', services: [SERVICES.underbody], worker: 'علي' },
];

const payroll = (page: Page) => page.getByRole('region', { name: 'الأجور' });
const payRow = (page: Page, name: string) =>
  payroll(page).getByRole('row', { name: new RegExp(`^${name}`) });
const month = (page: Page) => page.getByRole('region', { name: 'حساب الشهر' });

test.describe.serial('milestone 6: workers’ pay and the month’s finance', () => {
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
    await setUpCatalog(admin);
    await expectAllSynced(admin);
    await login(reception, CASHIER);
  });

  test('the cashier washes and delivers three cars', async () => {
    for (const car of CARS) {
      await registerWash(reception, car);
      await card(reception, car.plate).getByRole('button', { name: 'الزبون استلم مباشرة' }).click();
    }
    await expect(reception.getByRole('region', { name: 'سُلّمت اليوم' })).toContainText(
      '90,000 ل.س',
    );
    await expectAllSynced(reception);
  });

  test('the admin sees what each worker earned, and pays them', async () => {
    await admin.goto('/workers');
    await expect(payRow(admin, 'محمد')).toContainText('70,000 ل.س'); // wash value of his 2 cars
    await expect(payRow(admin, 'محمد')).toContainText('21,000 ل.س'); // 30%
    await expect(payRow(admin, 'علي')).toContainText('75,000 ل.س'); // one day

    await payRow(admin, 'علي').getByRole('button', { name: 'دفع' }).click();
    const form = admin.getByRole('region', { name: 'دفعة لعامل' });
    await expect(form.getByLabel('المبلغ (ل.س)')).toHaveValue('75,000');
    await form.getByRole('button', { name: 'تسجيل الدفعة' }).click();

    await payRow(admin, 'محمد').getByRole('button', { name: 'دفع' }).click();
    await form.getByText('سلفة', { exact: true }).click();
    await form.getByLabel('المبلغ (ل.س)').fill('10000');
    await form.getByRole('button', { name: 'تسجيل الدفعة' }).click();
    await expect(payRow(admin, 'محمد').getByRole('cell').nth(6)).toHaveText('11,000 ل.س');
    await expect(payRow(admin, 'علي').getByRole('cell').nth(6)).toHaveText('0 ل.س');
  });

  test('the month: income by source, spending against the budget, and the net', async () => {
    await nav(admin).getByRole('link', { name: 'الحسابات والتقارير' }).click();
    await admin.getByRole('button', { name: 'مصروف جديد' }).click();
    const form = admin.getByRole('region', { name: 'مصروف جديد' });
    await form.getByLabel('البند').selectOption({ label: 'إنترنت' });
    await form.getByLabel('المبلغ (ل.س)').fill('150000');
    await form.getByRole('button', { name: 'إضافة المصروف' }).click();

    await expect(month(admin)).toContainText('الدخل90,000 ل.س');
    await expect(month(admin)).toContainText('المصاريف235,000 ل.س'); // wages 85,000 + internet
    await expect(month(admin)).toContainText('الصافي-145,000 ل.س');

    const wagesBudget = admin.getByLabel('ميزانية أجور العمال');
    await wagesBudget.fill('50000');
    await wagesBudget.press('Enter');
    await expect(admin.getByRole('row', { name: /^أجور العمال/ })).toContainText(
      'تجاوز 35,000 ل.س',
    );
  });

  test('the month and the pay table are exported to Excel (right-to-left)', async () => {
    const finance = await exportExcel(admin, month(admin));
    expect(finance.name).toMatch(/^الحسابات \d{4}-\d{2}\.xlsx$/);
    expect(finance.book.getWorksheet('الملخص')?.views[0]).toMatchObject({ rightToLeft: true });
    expect(rowValues(finance.book, 'الملخص', 6)).toEqual(['الصافي', -145000]);
    expect(rowValues(finance.book, 'الدخل', 4)).toEqual(['الغسيل', 90000]);

    await admin.goto('/workers');
    const pay = await exportExcel(admin, payroll(admin));
    expect(pay.name).toMatch(/^الأجور \d{4}-\d{2}\.xlsx$/);
    expect(rowStarting(pay.book, 'الأجور', 'محمد')).toEqual([
      'محمد',
      'عمولة 30% من سعر الغسلة',
      2,
      70000,
      21000,
      10000,
      11000,
    ]);
    await nav(admin).getByRole('link', { name: 'الحسابات والتقارير' }).click();
  });

  test('deleting an expense is logged for the owner', async () => {
    const row = month(admin)
      .getByRole('row', { name: /إنترنت/ })
      .last();
    await row.getByRole('button', { name: 'حذف' }).click();
    await expect(month(admin)).toContainText('المصاريف85,000 ل.س');
    const log = admin.getByRole('region', { name: 'سجل العمليات الحساسة' });
    await expect(log).toContainText('حذف مصروف');
    await expect(log).toContainText('إنترنت (150,000 ل.س)');
    await expectAllSynced(admin);
  });
});
