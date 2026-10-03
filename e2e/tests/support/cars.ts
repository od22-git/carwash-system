import type { Locator } from '@playwright/test';

/** A car typed into a form. Without a phone it must already be known. */
export interface CarEntry {
  plate: string;
  phone?: string;
  name?: string;
}

/** First step of every car form: a known plate (Enter picks it) or a new sedan and customer. */
export async function pickCar(panel: Locator, car: CarEntry) {
  const plate = panel.getByLabel('رقم اللوحة');
  await plate.fill(car.plate);
  if (!car.phone) {
    await plate.press('Enter');
    return;
  }
  await panel.getByRole('button', { name: 'سيارة جديدة بهذه اللوحة' }).click();
  await panel.getByLabel('هاتف العميل (واتساب)').fill(car.phone);
  await panel.getByLabel('اسم العميل').fill(car.name ?? 'زبون');
  await panel.getByText('سيدان', { exact: true }).click();
  await panel.getByRole('button', { name: 'متابعة' }).click();
}
