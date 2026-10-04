import type { Workbook, Worksheet } from 'exceljs';
import type { Cell, SheetSpec } from './sheet-spec';

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6EEF2' } } as const;
/** Thousands separators; a negative amount (over budget, short) in red. */
const MONEY_FORMAT = '#,##0;[Red]-#,##0';

const loadExcel = async () => {
  const mod = await import('exceljs');
  return (mod as unknown as { default?: typeof mod }).default ?? mod;
};

const textLength = (cell: Cell) => (cell === null ? 1 : String(cell).length);

function addSheet(workbook: Workbook, spec: SheetSpec): Worksheet {
  const headerRow = spec.title ? 3 : 1;
  const sheet = workbook.addWorksheet(spec.name.slice(0, 31), {
    views: [{ rightToLeft: true, state: 'frozen', ySplit: headerRow }],
  });
  if (spec.title) {
    sheet.getCell(1, 1).value = spec.title;
    sheet.getCell(1, 1).font = { bold: true, size: 14 };
  }
  const header = sheet.getRow(headerRow);
  spec.columns.forEach((column, i) => {
    header.getCell(i + 1).value = column.money ? `${column.header} (ل.س)` : column.header;
  });
  header.font = { bold: true };
  header.eachCell((cell) => (cell.fill = HEADER_FILL));

  for (const row of spec.rows) sheet.addRow(row);
  if (spec.totals) {
    const totals = sheet.addRow(spec.totals);
    totals.font = { bold: true };
    totals.eachCell((cell) => (cell.border = { top: { style: 'thin' } }));
  }

  spec.columns.forEach((column, i) => {
    const values = [...spec.rows.map((r) => r[i] ?? null), spec.totals?.[i] ?? null];
    const fitted = Math.max(
      column.header.length + (column.money ? 6 : 0),
      ...values.map(textLength),
    );
    const sheetColumn = sheet.getColumn(i + 1);
    sheetColumn.width = column.width ?? Math.min(Math.max(fitted + 2, 10), 50);
    if (column.money) sheetColumn.numFmt = MONEY_FORMAT;
  });
  return sheet;
}

/** An RTL workbook from the given sheets (exceljs is loaded only when exporting). */
export async function buildWorkbook(sheets: SheetSpec[]): Promise<Workbook> {
  const ExcelJS = await loadExcel();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'نظام المغسلة';
  workbook.created = new Date();
  for (const spec of sheets) addSheet(workbook, spec);
  return workbook;
}
