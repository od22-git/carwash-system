/**
 * Three separate stocks:
 * - consumable: used up while washing, never sold (paper, shampoo, polish, pH, seat bags, fresheners, diesel)
 * - stock:      car products for sale (engine oil, brake oil, sprays, ...)
 * - buffet:     drinks and food for sale
 */
export const PRODUCT_KINDS = ['consumable', 'stock', 'buffet'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  consumable: 'مواد الهدر',
  stock: 'المخزون (للبيع)',
  buffet: 'البوفيه (للبيع)',
};

export const isSellable = (kind: ProductKind) => kind !== 'consumable';
