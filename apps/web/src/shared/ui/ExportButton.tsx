import { downloadExcel, type SheetSpec } from '../lib/excel';
import { useAction } from '../lib/use-action';
import { Button } from './Button';
import { Notice } from './Notice';

interface ExportButtonProps {
  /** Without ".xlsx", e.g. "الحسابات 2026-10". */
  fileName: string;
  /** Built when clicked, from what the screen shows. */
  sheets: () => SheetSpec[];
}

/** Saves the report on screen as an Excel file (right-to-left). */
export function ExportButton({ fileName, sheets }: ExportButtonProps) {
  const action = useAction();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        disabled={action.busy}
        onClick={() => void action.run(() => downloadExcel(fileName, sheets()))}
      >
        {action.busy ? 'جارٍ التصدير…' : 'تصدير Excel'}
      </Button>
      {action.error && <Notice tone="error">{action.error}</Notice>}
    </div>
  );
}
