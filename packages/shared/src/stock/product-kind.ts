/**
 * Three separate stocks:
 * - consumable: used up while washing, never sold (paper, shampoo, polish, pH, seat bags,
 *   fresheners, diesel). Counted every evening; what is missing is the day's waste.
 * - stock:      car products for sale (engine oil, brake oil, sprays, ...)
 * - buffet:     drinks and food for sale
 */
export const PRODUCT_KINDS = ['consumable', 'stock', 'buffet'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const SELLABLE_KINDS = ['stock', 'buffet'] as const;
export type SellableKind = (typeof SELLABLE_KINDS)[number];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  consumable: 'مواد الهدر',
  stock: 'منتجات السيارات',
  buffet: 'البوفيه',
};

export const isSellable = (kind: ProductKind): kind is SellableKind => kind !== 'consumable';
