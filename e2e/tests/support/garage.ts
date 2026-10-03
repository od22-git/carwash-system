import { expect, type Page } from '@playwright/test';
import { SERVICES } from './catalog-setup';
import { pickCar, type CarEntry } from './cars';
import { nav } from './helpers';

export const parkedCard = (page: Page, plate: string) =>
  page
    .getByRole('region', { name: 'في الكراج الآن' })
    .getByRole('article', { name: `سيارة ${plate}` });

export const garageToday = (page: Page) => page.getByRole('region', { name: 'إيصالات اليوم' });

export const runningPackages = (page: Page) =>
  page.getByRole('region', { name: 'الباقات الفعّالة' });

/** The admin's offers: a day plan for 150,000 and a monthly package (4 exterior washes + garage). */
export async function setUpGarageOffers(admin: Page) {
  await nav(admin).getByRole('link', { name: 'الباقات وخطط الكراج' }).click();
  await admin.getByRole('button', { name: 'خطة جديدة' }).click();
  await admin.getByRole('button', { name: 'يوم', exact: true }).click();
  await admin.getByLabel('السعر (ل.س)').fill('150000');
  await admin.getByRole('button', { name: 'إضافة الخطة' }).click();
  await expect(admin.getByRole('cell', { name: '150,000 ل.س' })).toBeVisible();

  await admin.getByRole('button', { name: 'باقة جديدة' }).click();
  await admin.getByLabel('اسم الباقة').fill('شهري');
  await admin.getByLabel('السعر (ل.س)').fill('500000');
  await admin.getByLabel('عدد الغسلات المجانية').fill('4');
  await admin.getByLabel(SERVICES.exterior).check();
  await admin.getByLabel('تشمل الكراج').check();
  await admin.getByRole('button', { name: 'إضافة الباقة' }).click();
  await expect(admin.getByRole('cell', { name: '4 غسلات مجانية + الكراج' })).toBeVisible();
}

/** A car comes into the garage (by the hour unless a plan is named). */
export async function parkCar(page: Page, car: CarEntry & { plan?: string }) {
  await page.getByRole('button', { name: 'سيارة تدخل الكراج' }).click();
  const panel = page.getByRole('region', { name: 'سيارة تدخل الكراج' });
  await pickCar(panel, car);
  if (car.plan) await panel.getByLabel(car.plan).check();
  await panel.getByRole('button', { name: 'تسجيل دخول الكراج' }).click();
  await expect(panel.getByText(`دخلت السيارة ${car.plate} الكراج`)).toBeVisible();
  await panel.getByRole('button', { name: 'إغلاق' }).click();
}

export async function sellPackage(page: Page, car: CarEntry, packageName: string) {
  await page.getByRole('button', { name: 'بيع باقة' }).click();
  const panel = page.getByRole('region', { name: 'بيع باقة' });
  await pickCar(panel, car);
  await panel.getByLabel(packageName).check();
  await panel.getByRole('button', { name: /^بيع الباقة/ }).click();
  await expect(panel.getByText(`بيعت باقة ${packageName} للسيارة ${car.plate}`)).toBeVisible();
  await panel.getByRole('button', { name: 'طباعة الإيصال' }).click();
  await panel.getByRole('button', { name: 'إغلاق' }).click();
}
