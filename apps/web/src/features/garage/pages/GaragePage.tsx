import { useState } from 'react';
import { startOfDay } from '../../../shared/lib/time-format';
import { useNow } from '../../../shared/lib/use-now';
import { Button, PageHeader } from '../../../shared/ui';
import { ParkCarPanel } from '../components/parking/ParkCarPanel';
import { ParkedCars } from '../components/parking/ParkedCars';
import { RunningSubscriptions } from '../components/subscriptions/RunningSubscriptions';
import { SellPackagePanel } from '../components/subscriptions/SellPackagePanel';
import { GarageToday } from '../components/today/GarageToday';
import { GarageContext } from '../hooks/garage-context';
import { useGarageContextValue } from '../hooks/use-garage-context-value';
import { useParkedCars } from '../hooks/use-parking-sessions';

type Panel = 'park' | 'sell' | null;
const MINUTE = 60_000;

export function GaragePage() {
  const context = useGarageContextValue();
  const parked = useParkedCars();
  const now = useNow();
  const [panel, setPanel] = useState<Panel>(null);
  if (!context || !parked) return null;
  const close = () => setPanel(null);

  return (
    <GarageContext.Provider value={context}>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="الكراج"
          actions={
            panel === null && (
              <>
                <Button onClick={() => setPanel('park')}>سيارة تدخل الكراج</Button>
                <Button variant="secondary" onClick={() => setPanel('sell')}>
                  بيع باقة
                </Button>
              </>
            )
          }
        />
        {panel === 'park' && <ParkCarPanel parked={parked} onClose={close} />}
        {panel === 'sell' && <SellPackagePanel onClose={close} />}
        <ParkedCars parked={parked} now={now} />
        <GarageToday today={startOfDay(now)} />
        <RunningSubscriptions now={Math.floor(now / MINUTE) * MINUTE} />
      </div>
    </GarageContext.Provider>
  );
}
