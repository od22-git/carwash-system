import { expect, type Page } from '@playwright/test';
import { pickCar, type CarEntry } from './cars';

/** Card of one car on the wash board. */
export const card = (page: Page, plate: string) =>
  page.getByRole('article', { name: `سيارة ${plate}` });

export const column = (page: Page, title: string) => page.getByRole('region', { name: title });

interface WashEntry extends CarEntry {
  services: string[];
  worker: string;
  requested?: boolean;
  /** Leave the package's free wash unticked. */
  payFull?: boolean;
}

/** Registers a car from the wash screen, as the cashier does. */
export async function registerWash(page: Page, car: WashEntry) {
  await page.getByRole('button', { name: 'سيارة جديدة' }).click();
  const panel = page.getByRole('region', { name: 'تسجيل سيارة' });
  await pickCar(panel, car);
  for (const service of car.services) await panel.getByLabel(service).check();
  if (car.payFull) await panel.getByLabel(/استخدام غسلة مجانية/).uncheck();
  await panel.getByText(car.worker, { exact: true }).click();
  if (car.requested) await panel.getByLabel('الزبون طلب هذا العامل').check();
  await panel.getByRole('button', { name: /بدء الغسيل|تسجيل \(بانتظار العامل\)/ }).click();
  await expect(panel.getByText(`سُجّلت السيارة ${car.plate}`)).toBeVisible();
  await panel.getByRole('button', { name: 'إغلاق' }).click();
}
