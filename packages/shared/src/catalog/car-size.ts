/** Car size decides the wash price. */
export const CAR_SIZES = ['small', 'sedan', 'suv', 'van'] as const;
export type CarSize = (typeof CAR_SIZES)[number];

export const CAR_SIZE_LABELS: Record<CarSize, string> = {
  small: 'صغيرة',
  sedan: 'سيدان',
  suv: 'جيب',
  van: 'فان',
};
