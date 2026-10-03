import { usePrintContent } from './print-store';

/** Hidden on screen; the only thing visible when printing (see theme.css). */
export function PrintSlot() {
  const content = usePrintContent();
  return <div className="print-area">{content}</div>;
}
