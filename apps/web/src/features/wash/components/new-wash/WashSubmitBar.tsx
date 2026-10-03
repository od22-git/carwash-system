import { formatSYP } from '@carwash/shared';
import { Button } from '../../../../shared/ui';

interface WashSubmitBarProps {
  total: number;
  disabled: boolean;
  /** The chosen worker is busy, so the car will wait. */
  waits: boolean;
}

export function WashSubmitBar({ total, disabled, waits }: WashSubmitBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-line pt-4">
      <p className="font-display text-xl font-bold">المجموع: {formatSYP(total)}</p>
      <Button type="submit" disabled={disabled}>
        {waits ? 'تسجيل (بانتظار العامل)' : 'بدء الغسيل'}
      </Button>
    </div>
  );
}
