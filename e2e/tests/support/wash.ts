import { expect, type Page } from '@playwright/test';

/** Card of one car on the wash board. */
export const card = (page: Page, plate: string) =>
  page.getByRole('article', { name: `سيارة ${plate}` });

export const column = (page: Page, title: string) => page.getByRole('region', { name: title });

interface NewCar {
  plate: string;
  phone: string;
  name: string;
  services: string[];
  worker: string;
  requested?: boolean;
}

/** Registers an unknown car from the wash screen, as the cashier does. */
export async function registerNewCar(page: Page, car: NewCar) {
  await page.getByRole('button', { name: 'سيارة جديدة' }).click();
  const panel = page.getByRole('region', { name: 'تسجيل سيارة' });
  await panel.getByLabel('رقم اللوحة').fill(car.plate);
  await panel.getByRole('button', { name: 'سيارة جديدة بهذه اللوحة' }).click();
  await panel.getByLabel('هاتف العميل (واتساب)').fill(car.phone);
  await panel.getByLabel('اسم العميل').fill(car.name);
  await panel.getByText('سيدان', { exact: true }).click();
  await panel.getByRole('button', { name: 'متابعة' }).click();
  for (const service of car.services) await panel.getByLabel(service).check();
  await panel.getByText(car.worker, { exact: true }).click();
  if (car.requested) await panel.getByLabel('الزبون طلب هذا العامل').check();
  await panel.getByRole('button', { name: /بدء الغسيل|تسجيل \(بانتظار العامل\)/ }).click();
  await expect(panel.getByText(`سُجّلت السيارة ${car.plate}`)).toBeVisible();
  await panel.getByRole('button', { name: 'إغلاق' }).click();
}
