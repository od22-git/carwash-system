import { PageHeader } from '../shared/ui';

/** Stands in for screens that are built in later milestones. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <p className="text-muted">هذه الشاشة تُبنى في مرحلة لاحقة من المشروع.</p>
    </>
  );
}
