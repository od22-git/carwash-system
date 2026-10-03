import type { SaleRecord } from '@carwash/shared';
import { printNode } from '../../../core/print';
import { Button } from '../../../shared/ui';
import { useSetting } from '../../settings';
import { SaleReceipt } from './SaleReceipt';

export function PrintSaleButton({ sale }: { sale: SaleRecord }) {
  const { value } = useSetting('receipt');
  return (
    <Button variant="quiet" onClick={() => printNode(<SaleReceipt sale={sale} {...value} />)}>
      طباعة الإيصال
    </Button>
  );
}
