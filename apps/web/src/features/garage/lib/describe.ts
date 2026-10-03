import {
  formatSYP,
  type GarageSettings,
  type PackageTerms,
  type ParkingPlan,
} from '@carwash/shared';

/** "بالساعة" or "يوم (24 ساعة)". */
export const planLabel = (planName: string, plan: ParkingPlan) =>
  plan.kind === 'hourly' ? planName : `${planName} (${plan.durationHours} ساعة)`;

/** What the plan costs, in one line for the picker. */
export function planPriceText(plan: ParkingPlan, settings: GarageSettings): string {
  if (plan.kind === 'fixed') return `${formatSYP(plan.price)}، وبعدها بالساعة`;
  const free = settings.parkingFreeMinutes;
  return `${formatSYP(settings.hourlyRate)} للساعة${free > 0 ? `، أول ${free} دقيقة مجانية` : ''}`;
}

/** "4 غسلات مجانية + الكراج". */
export function termsText({ freeWashes, includesParking }: PackageTerms): string {
  const parts = [
    freeWashes > 0 && `${freeWashes} غسلات مجانية`,
    includesParking && 'الكراج',
  ].filter(Boolean);
  return parts.join(' + ');
}
