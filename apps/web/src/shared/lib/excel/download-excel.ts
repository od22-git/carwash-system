import { buildWorkbook } from './build-workbook';
import type { SheetSpec } from './sheet-spec';

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Builds the workbook and saves it as "<fileName>.xlsx" (the browser's Downloads). */
export async function downloadExcel(fileName: string, sheets: SheetSpec[]) {
  const workbook = await buildWorkbook(sheets);
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: XLSX_TYPE }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
