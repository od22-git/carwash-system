import { formatSYP } from '@carwash/shared';
import { formatDate } from '../../../../shared/lib/time-format';
import { Checkbox } from '../../../../shared/ui';
import type { VehicleSubscription } from '../../../garage';

interface PackageWashChoiceProps {
  current: VehicleSubscription;
  /** Names of the services a free wash covers. */
  coveredNames: string[];
  discount: number;
  useFreeWash: boolean;
  onUseFreeWash: (use: boolean) => void;
}

/** The car has a package: offer one of its free washes. */
export function PackageWashChoice(props: PackageWashChoiceProps) {
  const { subscription: sub, washesLeft } = props.current;
  const hint =
    props.discount > 0
      ? `يُخصم ${formatSYP(props.discount)}`
      : `تشمل: ${props.coveredNames.join('، ')}. اختر إحداها من الخدمات.`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-foam/40 bg-foam/5 p-4">
      <p className="font-semibold">
        باقة {sub.packageName} حتى {formatDate(sub.endsAt)}
        {sub.includesParking && '، الكراج مشمول'}
      </p>
      {sub.freeWashes > 0 &&
        (washesLeft > 0 ? (
          <Checkbox
            label={`استخدام غسلة مجانية (باقي ${washesLeft} من ${sub.freeWashes})`}
            hint={hint}
            checked={props.useFreeWash}
            onChange={props.onUseFreeWash}
          />
        ) : (
          <p className="text-sm text-muted">استُخدمت كل الغسلات المجانية في هذه الباقة.</p>
        ))}
    </div>
  );
}
