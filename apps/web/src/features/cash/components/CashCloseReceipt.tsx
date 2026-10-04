import { cashDifference, formatSYP, type CashCloseRecord } from '@carwash/shared';
import { printNode } from '../../../core/print';
import { Button, Receipt, ReceiptRow, ReceiptSection } from '../../../shared/ui';
import { useSetting } from '../../settings';
import { differenceLabel } from './difference';

interface CashCloseReceiptProps {
  close: CashCloseRecord;
  shopName: string;
}

/** The day's close on the thermal printer, to keep with the cash. */
function CashCloseReceipt({ close, shopName }: CashCloseReceiptProps) {
  return (
    <Receipt
      shopName={shopName}
      footer=""
      receiptNo={close.day}
      at={close.at}
      atLabel="وقت الإغلاق"
      cancelled={false}
      total={formatSYP(close.counted)}
    >
      <ReceiptRow label="البيان" value="إغلاق الصندوق" />
      <ReceiptRow label="أغلقه" value={close.closedBy} />
      <ReceiptSection>
        <ReceiptRow label="الفكة أول اليوم" value={formatSYP(close.float)} />
        <ReceiptRow label="دخل الصندوق" value={formatSYP(close.expected)} />
        <ReceiptRow label="مدفوع من الصندوق" value={formatSYP(close.paidOut)} />
        <ReceiptRow label="الفرق" value={differenceLabel(cashDifference(close))} />
        {close.note && <ReceiptRow label="ملاحظة" value={close.note} />}
      </ReceiptSection>
    </Receipt>
  );
}

export function PrintCashCloseButton({ close }: { close: CashCloseRecord }) {
  const { value } = useSetting('receipt');
  return (
    <Button
      variant="quiet"
      onClick={() => printNode(<CashCloseReceipt close={close} shopName={value.shopName} />)}
    >
      طباعة
    </Button>
  );
}
