import { expect, type Page } from '@playwright/test';
import { nav } from './helpers';

export const SERVICES = { exterior: 'خارجي (ماء وشامبو)', underbody: 'غسيل سفلي للسيارة' };

async function setPrice(admin: Page, service: string, size: string, price: string) {
  const cell = admin.getByLabel(`سعر ${service} لسيارة ${size}`);
  await cell.fill(price);
  await cell.press('Enter');
  await expect(cell).toHaveValue(Number(price).toLocaleString('en-US'));
}

async function addWorker(
  admin: Page,
  name: string,
  payLabel: string,
  rateLabel: string,
  rate: string,
) {
  await admin.getByRole('button', { name: 'عامل جديد' }).click();
  await admin.getByLabel('اسم العامل').fill(name);
  await admin.getByLabel(payLabel).check();
  await admin.getByLabel(rateLabel).fill(rate);
  await admin.getByRole('button', { name: 'إضافة العامل' }).click();
  await expect(admin.getByRole('cell', { name, exact: true })).toBeVisible();
}

/** The admin's first-day setup: the nine services, two prices for sedans, two workers. */
export async function setUpCatalog(admin: Page) {
  await nav(admin).getByRole('link', { name: 'الخدمات والأسعار' }).click();
  await admin.getByRole('button', { name: 'إضافة الخدمات الأساسية' }).click();
  await setPrice(admin, SERVICES.exterior, 'سيدان', '25000');
  await setPrice(admin, SERVICES.underbody, 'سيدان', '20000');

  await nav(admin).getByRole('link', { name: 'العمال' }).click();
  await addWorker(
    admin,
    'محمد',
    'عمولة (نسبة من سعر الغسلة)',
    'نسبة العمولة من سعر الغسلة (%)',
    '30',
  );
  await addWorker(admin, 'علي', 'أجر مقطوع يومي', 'الأجر اليومي (ل.س)', '75000');
}
