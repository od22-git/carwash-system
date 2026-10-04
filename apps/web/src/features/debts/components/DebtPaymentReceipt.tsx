import { formatSYP, type DebtPaymentRecord } from '@carwash/shared';
import { printNode } from '../../../core/print';
import { Button, Receipt, ReceiptRow } from '../../../shared/ui';
import { useSetting } from '../../settings';

interface DebtPaymentReceiptProps {
  payment: DebtPaymentRecord;
  shopName: string;
  footer: string;
}

function DebtPaymentReceipt({ payment, shopName, footer }: DebtPaymentReceiptProps) {
  return (
    <Receipt
      shopName={shopName}
      footer={footer}
      receiptNo={payment.receiptNo}
      at={payment.at}
      atLabel="الوقت"
      cancelled={false}
      total={formatSYP(payment.amount)}
    >
      <ReceiptRow label="العميل" value={payment.customerName} />
      <ReceiptRow label="البيان" value="دفعة من الحساب (آجل)" />
    </Receipt>
  );
}

export function PrintDebtPaymentButton({ payment }: { payment: DebtPaymentRecord }) {
  const { value } = useSetting('receipt');
  return (
    <Button
      variant="quiet"
      onClick={() => printNode(<DebtPaymentReceipt payment={payment} {...value} />)}
    >
      طباعة الإيصال
    </Button>
  );
}
