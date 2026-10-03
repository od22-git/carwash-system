export const DEFAULT_READY_TEMPLATE =
  'مرحباً {name}، سيارتك {plate} جاهزة. لديك {grace} دقيقة للاستلام، وبعدها يُحسب سعر الكراج.';

/** Replaces {key} placeholders. Unknown placeholders are left as they are. */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
