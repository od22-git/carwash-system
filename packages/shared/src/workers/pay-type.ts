/** A worker is paid fixed (daily or weekly) OR by commission on the wash price, never both. */
export const PAY_TYPES = ['fixed_daily', 'fixed_weekly', 'commission'] as const;
export type PayType = (typeof PAY_TYPES)[number];

export const PAY_TYPE_LABELS: Record<PayType, string> = {
  fixed_daily: 'أجر مقطوع يومي',
  fixed_weekly: 'أجر مقطوع أسبوعي',
  commission: 'عمولة (نسبة من سعر الغسلة)',
};
