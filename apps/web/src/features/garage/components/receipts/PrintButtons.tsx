import type { ParkingSessionRecord, SubscriptionRecord } from '@carwash/shared';
import { printNode } from '../../../../core/print';
import { Button } from '../../../../shared/ui';
import { useGarage } from '../../hooks/garage-context';
import { ParkingReceipt } from './ParkingReceipt';
import { SubscriptionReceipt } from './SubscriptionReceipt';

export function PrintParkingButton({ session }: { session: ParkingSessionRecord }) {
  const { receipt } = useGarage();
  const print = () => printNode(<ParkingReceipt session={session} {...receipt} />);
  return (
    <Button variant="quiet" onClick={print}>
      طباعة الإيصال
    </Button>
  );
}

export function PrintSubscriptionButton({ sub }: { sub: SubscriptionRecord }) {
  const { receipt } = useGarage();
  const print = () => printNode(<SubscriptionReceipt sub={sub} {...receipt} />);
  return (
    <Button variant="quiet" onClick={print}>
      طباعة الإيصال
    </Button>
  );
}
