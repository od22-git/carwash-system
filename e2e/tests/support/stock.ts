import { expect, type Page } from '@playwright/test';
import { nav } from './helpers';

export interface NewProduct {
  name: string;
  /** Only on the stock screen, which has two kinds. */
  kind?: 'منتجات السيارات' | 'البوفيه';
  unit?: string;
  unitsPerCarton?: string;
  minQty?: string;
  barcode?: string;
  retailPrice?: string;
  wholesalePrice?: string;
}

/** The admin adds a product on the current stock screen ("صنف جديد" or "مادة جديدة"). */
export async function addProduct(page: Page, button: string, p: NewProduct) {
  await page.getByRole('button', { name: button, exact: true }).click();
  const panel = page.getByRole('region', { name: button });
  if (p.kind) await panel.getByText(p.kind, { exact: true }).click();
  await panel.getByLabel('اسم الصنف').fill(p.name);
  if (p.unit) await panel.getByLabel('الوحدة').fill(p.unit);
  if (p.unitsPerCarton) await panel.getByLabel('عدد الوحدات في الكرتونة').fill(p.unitsPerCarton);
  if (p.minQty) await panel.getByLabel('حد التنبيه (وحدات)').fill(p.minQty);
  if (p.barcode) await panel.getByLabel('الباركود').fill(p.barcode);
  if (p.retailPrice) await panel.getByLabel('سعر القطعة (ل.س)').fill(p.retailPrice);
  if (p.wholesalePrice) await panel.getByLabel('سعر الكرتونة جملة (ل.س)').fill(p.wholesalePrice);
  await panel.getByRole('button', { name: 'إضافة الصنف' }).click();
  await expect(panel).toHaveCount(0);
}

export interface Purchase {
  product: string;
  /** Cartons when the product comes in cartons, pieces otherwise. */
  quantity: string;
  price: string;
  byPiece?: boolean;
}

/** The admin records stock arriving, from the row's "شراء" button. */
export async function buy(page: Page, p: Purchase) {
  await stockRow(page, p.product).getByRole('button', { name: 'شراء' }).click();
  const panel = page.getByRole('region', { name: 'شراء بضاعة' });
  if (p.byPiece) await panel.getByText('بالقطعة (مفرّق)').click();
  const inCartons = await panel.getByLabel('عدد الكراتين').isVisible();
  await panel.getByLabel(inCartons ? 'عدد الكراتين' : 'عدد القطع').fill(p.quantity);
  await panel.getByLabel(inCartons ? 'سعر الكرتونة (ل.س)' : 'سعر القطعة (ل.س)').fill(p.price);
  await panel.getByRole('button', { name: 'تسجيل الشراء' }).click();
  await expect(panel.getByText(`من ${p.product}، الكلفة`)).toBeVisible();
  await panel.getByRole('button', { name: 'إغلاق' }).click();
}

/** A product's row in the stock table (not in the reports below it). */
export const stockRow = (page: Page, name: string) =>
  page
    .getByRole('region', { name: 'الأصناف' })
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name, exact: true }) });

/** The count: type what is on the shelf for each product, then save. */
export async function count(
  page: Page,
  button: string,
  title: string,
  counts: Record<string, string>,
) {
  await page.getByRole('button', { name: button, exact: true }).click();
  const panel = page.getByRole('region', { name: title });
  for (const [name, value] of Object.entries(counts)) {
    await panel.getByLabel(`العدد الآن: ${name}`).fill(value);
  }
  await panel.getByRole('button', { name: 'حفظ الجرد' }).click();
  return panel;
}

export const goTo = (page: Page, label: string) =>
  nav(page).getByRole('link', { name: label }).click();
