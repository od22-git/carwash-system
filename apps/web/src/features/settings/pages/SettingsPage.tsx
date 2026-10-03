import { useSessionUser } from '../../../core/auth';
import { PageHeader, Panel } from '../../../shared/ui';
import { GarageSettingsForm } from '../components/GarageSettingsForm';
import { ReceiptSettingsForm } from '../components/ReceiptSettingsForm';
import { UsersPanel } from '../components/UsersPanel';
import { WhatsappSettingsForm } from '../components/WhatsappSettingsForm';
import { useSetting } from '../hooks/use-setting';

export function SettingsPage() {
  const user = useSessionUser();
  const garage = useSetting('garage');
  const receipt = useSetting('receipt');
  const whatsapp = useSetting('whatsapp');
  if (!user || garage.loading || receipt.loading || whatsapp.loading) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الإعدادات" />
      <Panel
        title="الكراج والاستلام"
        description="تُطبَّق على الجهازين بعد المزامنة، وتعمل بدون إنترنت."
      >
        <GarageSettingsForm setting={garage} />
      </Panel>
      <Panel title="رسالة واتساب">
        <WhatsappSettingsForm setting={whatsapp} />
      </Panel>
      <Panel title="الإيصال">
        <ReceiptSettingsForm setting={receipt} />
      </Panel>
      <UsersPanel currentUserId={user.id} />
    </div>
  );
}
