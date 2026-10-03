import { formatSYP, type SubscriptionRecord } from '@carwash/shared';
import { formatDate } from '../../../../shared/lib/time-format';
import { Receipt, ReceiptRow } from '../../../../shared/ui';

interface SubscriptionReceiptProps {
  sub: SubscriptionRecord;
  shopName: string;
  footer: string;
}

/** The customer's proof of the package: what it gives and until when. */
export function SubscriptionReceipt({ sub, shopName, footer }: SubscriptionReceiptProps) {
  return (
    <Receipt
      shopName={shopName}
      footer={footer}
      receiptNo={sub.receiptNo}
      at={sub.createdAt}
      atLabel="وقت البيع"
      plate={sub.plate}
      cancelled={sub.status === 'cancelled'}
      total={formatSYP(sub.price)}
    >
      <ReceiptRow label="العميل" value={sub.customerName} />
      <ReceiptRow label="الباقة" value={sub.packageName} />
      <ReceiptRow label="من" value={formatDate(sub.startsAt)} />
      <ReceiptRow label="حتى" value={formatDate(sub.endsAt)} />
      {sub.freeWashes > 0 && <ReceiptRow label="غسلات مجانية" value={String(sub.freeWashes)} />}
      <ReceiptRow label="الكراج" value={sub.includesParking ? 'مشمول' : 'غير مشمول'} />
    </Receipt>
  );
}
