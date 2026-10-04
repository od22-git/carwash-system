import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { buildWorkbook } from './build-workbook';

const spec = {
  name: 'الدخل',
  title: 'الحسابات: 2026-10',
  columns: [{ header: 'المصدر' }, { header: 'المبلغ', money: true }],
  rows: [
    ['الغسيل', 1_250_000],
    ['الكراج', null],
  ],
  totals: ['المجموع', 1_250_000],
};

describe('Excel export', () => {
  it('right-to-left sheets with a title, a header, money columns and a bold total', async () => {
    const workbook = await buildWorkbook([spec]);
    const sheet = workbook.getWorksheet('الدخل')!;
    expect(sheet.views[0]).toMatchObject({ rightToLeft: true, ySplit: 3 });
    expect(sheet.getCell('A1').value).toBe('الحسابات: 2026-10');
    expect(sheet.getRow(3).values).toEqual([undefined, 'المصدر', 'المبلغ (ل.س)']);
    expect(sheet.getCell('B4').value).toBe(1_250_000);
    expect(sheet.getColumn(2).numFmt).toBe('#,##0;[Red]-#,##0');
    expect(sheet.getRow(6).font).toMatchObject({ bold: true });
  });

  it('writes a file Excel can open', async () => {
    const buffer = await (await buildWorkbook([spec])).xlsx.writeBuffer();
    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(buffer);
    expect(reopened.getWorksheet('الدخل')!.getCell('A6').value).toBe('المجموع');
  });
});
