import { useState } from 'react';
import { useNow } from '../../../shared/lib/use-now';
import { Button, PageHeader } from '../../../shared/ui';
import { WashBoard } from '../components/board/WashBoard';
import { ClosedToday } from '../components/ClosedToday';
import { NewWashPanel } from '../components/new-wash/NewWashPanel';
import { useOpenTickets } from '../hooks/use-tickets';
import { WashContext } from '../hooks/wash-context';
import { useWashContextValue } from '../hooks/use-wash-context-value';

export function WashPage() {
  const context = useWashContextValue();
  const open = useOpenTickets();
  const now = useNow();
  const [registering, setRegistering] = useState(false);
  if (!context || !open) return null;

  return (
    <WashContext.Provider value={context}>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="الغسيل"
          actions={
            !registering && <Button onClick={() => setRegistering(true)}>سيارة جديدة</Button>
          }
        />
        {registering && <NewWashPanel openTickets={open} onClose={() => setRegistering(false)} />}
        <WashBoard tickets={open} now={now} />
        <ClosedToday now={now} />
      </div>
    </WashContext.Provider>
  );
}
