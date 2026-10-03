import { PageHeader } from '../../../shared/ui';
import { PackagesPanel } from '../components/packages/PackagesPanel';
import { ParkingPlansPanel } from '../components/plans/ParkingPlansPanel';

/** Admin: how the garage is charged, and the packages on offer. */
export function PackagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الباقات وخطط الكراج" />
      <ParkingPlansPanel />
      <PackagesPanel />
    </div>
  );
}
