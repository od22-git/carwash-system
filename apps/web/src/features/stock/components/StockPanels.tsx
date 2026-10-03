import { RegisterPanel } from '../../../shared/ui';
import { productById, useStock } from '../hooks/stock-context';
import { CountPanel } from './count/CountPanel';
import { DamageForm } from './losses/DamageForm';
import { ProductForm } from './products/ProductForm';
import { PurchaseForm } from './purchases/PurchaseForm';

export type StockPanel =
  | { type: 'product'; productId?: string }
  | { type: 'purchase'; productId?: string }
  | { type: 'damage' }
  | { type: 'count' }
  | null;

interface StockPanelsProps {
  panel: StockPanel;
  onClose: () => void;
  /** "مادة جديدة" or "صنف جديد". */
  newTitle: string;
  countTitle: string;
  countHint: string;
  /** What the count's missing units are called: "الهدر" or "الفقد". */
  wasteLabel: string;
}

/** The one form open above a stock screen. */
export function StockPanels({ panel, onClose, ...text }: StockPanelsProps) {
  const ctx = useStock();
  if (!panel) return null;

  switch (panel.type) {
    case 'product': {
      const product = panel.productId ? productById(ctx, panel.productId) : undefined;
      return (
        <RegisterPanel title={product ? `تعديل ${product.name}` : text.newTitle} onClose={onClose}>
          <ProductForm key={panel.productId ?? 'new'} product={product} onDone={onClose} />
        </RegisterPanel>
      );
    }
    case 'purchase':
      return (
        <RegisterPanel title="شراء بضاعة" onClose={onClose}>
          <PurchaseForm key={panel.productId ?? 'any'} initialProductId={panel.productId} />
        </RegisterPanel>
      );
    case 'damage':
      return (
        <RegisterPanel title="تسجيل تالف" onClose={onClose}>
          <DamageForm />
        </RegisterPanel>
      );
    case 'count':
      return (
        <RegisterPanel title={text.countTitle} onClose={onClose}>
          <p className="max-w-prose text-muted">{text.countHint}</p>
          <CountPanel wasteLabel={text.wasteLabel} />
        </RegisterPanel>
      );
  }
}
