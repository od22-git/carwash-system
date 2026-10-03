import { useState } from 'react';
import { Button, PageHeader, Panel } from '../../../shared/ui';
import { WorkerForm } from '../components/WorkerForm';
import { WorkersTable } from '../components/WorkersTable';
import { useWorkers } from '../hooks/use-workers';

/** `editing` is a worker id, "new", or null. Pay reports come in milestone 6. */
export function WorkersPage() {
  const { workers, loading } = useWorkers();
  const [editing, setEditing] = useState<string | null>(null);
  const close = () => setEditing(null);
  const current = workers.find((w) => w.id === editing);
  if (loading) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="العمال"
        actions={<Button onClick={() => setEditing('new')}>عامل جديد</Button>}
      />
      {editing && (
        <Panel title={current ? `تعديل ${current.name}` : 'عامل جديد'}>
          <WorkerForm key={editing} worker={current} onDone={close} />
        </Panel>
      )}
      {workers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-6 text-muted">
          لا يوجد عمال بعد. أضف العمال ليتمكّن الموظف من تحديد من يغسل كل سيارة.
        </p>
      ) : (
        <WorkersTable workers={workers} onEdit={setEditing} />
      )}
    </div>
  );
}
