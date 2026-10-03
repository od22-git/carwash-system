import { useAction } from '../../../shared/lib/use-action';
import { Button, Notice, PageHeader } from '../../../shared/ui';
import { AddServiceForm } from '../components/AddServiceForm';
import { PriceTable } from '../components/PriceTable';
import { useCatalog } from '../hooks/use-catalog';
import { addDefaultServices } from '../lib/catalog-actions';

export function ServicesPage() {
  const { services, matrix, loading } = useCatalog();
  const seed = useAction();
  if (loading) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الخدمات والأسعار" />
      <p className="max-w-prose text-muted">
        يختار الموظف خدمة أو أكثر لكل سيارة، ويُحسب السعر حسب حجمها. اترك الخانة فارغة إذا كانت
        الخدمة غير متاحة لهذا الحجم. التعديل يُحفظ عند الخروج من الخانة.
      </p>

      {services.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line p-6">
          <p>لا توجد خدمات بعد. ابدأ بالخدمات التسع من العرض ثم أدخل أسعارها.</p>
          <Button disabled={seed.busy} onClick={() => void seed.run(addDefaultServices)}>
            إضافة الخدمات الأساسية
          </Button>
          {seed.error && <Notice tone="error">{seed.error}</Notice>}
        </div>
      ) : (
        <PriceTable services={services} matrix={matrix} />
      )}

      <AddServiceForm services={services} />
    </div>
  );
}
