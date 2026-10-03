import { useState } from 'react';
import { Button, Panel } from '../../../../shared/ui';
import { useSetting } from '../../../settings';
import { useParkingPlans } from '../../hooks/use-garage-catalog';
import { planPriceText } from '../../lib/describe';
import { PlanForm } from './PlanForm';
import { PlansTable } from './PlansTable';

/** Fixed-period plans (a day, two days, ...). Paying by the hour needs no plan. */
export function ParkingPlansPanel() {
  const { plans, loading } = useParkingPlans();
  const garage = useSetting('garage');
  const [editing, setEditing] = useState<string | null>(null);
  if (loading || garage.loading) return null;
  const current = plans.find((p) => p.id === editing);
  const hourly = planPriceText({ kind: 'hourly' }, garage.value);

  return (
    <Panel
      title="خطط الكراج"
      description={`الدفع بالساعة متاح دائماً: ${hourly} (يُعدَّل من الإعدادات). أضف هنا خططاً بمدة وسعر ثابتين، وما زاد عن المدة يُحسب بالساعة.`}
    >
      <div className="flex flex-col gap-4">
        {plans.length > 0 && <PlansTable plans={plans} onEdit={setEditing} />}
        {editing ? (
          <PlanForm key={editing} plan={current} plans={plans} onDone={() => setEditing(null)} />
        ) : (
          <Button variant="secondary" className="self-start" onClick={() => setEditing('new')}>
            خطة جديدة
          </Button>
        )}
      </div>
    </Panel>
  );
}
