import type { Locator, Page } from '@playwright/test';
import ExcelJS from 'exceljs';
import { readFile } from 'node:fs/promises';

/** Clicks "تصدير Excel" in the given part of the screen and opens the saved file. */
export async function exportExcel(page: Page, scope: Locator) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    scope.getByRole('button', { name: 'تصدير Excel' }).click(),
  ]);
  const book = new ExcelJS.Workbook();
  const file = await readFile(await download.path());
  await book.xlsx.load(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  return { name: download.suggestedFilename(), book };
}

/** A sheet row as plain values (exceljs rows start at index 1). */
export const rowValues = (book: ExcelJS.Workbook, sheet: string, row: number) =>
  (book.getWorksheet(sheet)?.getRow(row).values as unknown[]).slice(1);

/** The values of the first row whose first cell is `first` (e.g. a worker's name). */
export function rowStarting(book: ExcelJS.Workbook, sheet: string, first: string) {
  const rows = book.getWorksheet(sheet)?.getSheetValues() ?? [];
  const row = rows.find((r) => Array.isArray(r) && r[1] === first) as unknown[] | undefined;
  return row?.slice(1);
}
