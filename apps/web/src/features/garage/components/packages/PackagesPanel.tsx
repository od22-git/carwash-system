import { useState } from 'react';
import { Button, Panel } from '../../../../shared/ui';
import { usePackages } from '../../hooks/use-garage-catalog';
import { PackageForm } from './PackageForm';
import { PackagesTable } from './PackagesTable';

/** Packages the cashier can sell: days, price, free washes, garage included or not. */
export function PackagesPanel() {
  const { packages, loading } = usePackages();
  const [editing, setEditing] = useState<string | null>(null);
  if (loading) return null;
  const current = packages.find((p) => p.id === editing);

  return (
    <Panel
      title="الباقات"
      description="باقة لسيارة واحدة لمدة محددة: غسلات مجانية، أو الكراج، أو الاثنان معاً. تعديل الباقة لا يغيّر ما بيع منها سابقاً."
    >
      <div className="flex flex-col gap-4">
        {packages.length > 0 && <PackagesTable packages={packages} onEdit={setEditing} />}
        {editing ? (
          <PackageForm
            key={editing}
            pkg={current}
            packages={packages}
            onDone={() => setEditing(null)}
          />
        ) : (
          <Button variant="secondary" className="self-start" onClick={() => setEditing('new')}>
            باقة جديدة
          </Button>
        )}
      </div>
    </Panel>
  );
}
