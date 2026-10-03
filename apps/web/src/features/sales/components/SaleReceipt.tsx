import { formatSYP, SALE_MODE_LABELS, type SaleRecord } from '@carwash/shared';
import { Receipt, ReceiptRow, ReceiptSection } from '../../../shared/ui';

interface SaleReceiptProps {
  sale: SaleRecord;
  shopName: string;
  footer: string;
}

/** The counter sale's receipt: each item with its quantity and price. */
export function SaleReceipt({ sale, shopName, footer }: SaleReceiptProps) {
  return (
    <Receipt
      shopName={shopName}
      footer={footer}
      receiptNo={sale.receiptNo}
      at={sale.soldAt}
      atLabel="الوقت"
      cancelled={sale.status === 'cancelled'}
      total={formatSYP(sale.total)}
    >
      <ReceiptSection>
        {sale.lines.map((line) => (
          <ReceiptRow
            key={`${line.productId}:${line.mode}`}
            label={`${line.name} × ${line.quantity} ${SALE_MODE_LABELS[line.mode]}`}
            value={formatSYP(line.total)}
          />
        ))}
      </ReceiptSection>
    </Receipt>
  );
}
