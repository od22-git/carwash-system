import { expect, type Page } from '@playwright/test';
import { nav } from './helpers';

/** Opens a customer from the customers screen. */
export async function openCustomer(page: Page, name: string) {
  await nav(page).getByRole('link', { name: 'العملاء' }).click();
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

/** The customer's credit account (آجل) on the customer screen. */
export const account = (page: Page) => page.getByRole('region', { name: 'الحساب الآجل' });

/** The customer pays part of what they owe, from their account. */
export async function payDebt(page: Page, amount: string) {
  await account(page).getByLabel('المبلغ المدفوع (ل.س)').fill(amount);
  await account(page).getByRole('button', { name: 'تسجيل الدفعة' }).click();
  await expect(account(page)).toContainText('سُجّلت الدفعة، الإيصال');
}
