import { normalizeArabicName, toLatinDigits, type ProductRecord } from '@carwash/shared';

const MAX_MATCHES = 8;

/** A scanned barcode: the product with exactly this code. */
export function findByBarcode(products: ProductRecord[], code: string) {
  const wanted = toLatinDigits(code).trim();
  return wanted ? products.find((p) => p.barcode === wanted) : undefined;
}

/** Typed text: products whose name contains it, or whose barcode starts with it. */
export function searchProducts(products: ProductRecord[], text: string): ProductRecord[] {
  const name = normalizeArabicName(text);
  const code = toLatinDigits(text).trim();
  if (!name && !code) return [];
  return products
    .filter(
      (p) =>
        (name && normalizeArabicName(p.name).includes(name)) ||
        (code && p.barcode !== '' && p.barcode.startsWith(code)),
    )
    .slice(0, MAX_MATCHES);
}
