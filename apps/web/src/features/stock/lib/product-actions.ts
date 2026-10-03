import { DEFAULT_UNIT, isSellable, type ProductKind, type ProductRecord } from '@carwash/shared';
import { saveRecord } from '../../../core/sync';
import { parseWholeNumber } from '../../../shared/lib/parse-number';
import { UserError } from '../../../shared/lib/user-error';

/** The product form as typed (numbers may have commas or Arabic digits). */
export interface ProductInput {
  kind: ProductKind;
  name: string;
  unit: string;
  unitsPerCarton: string;
  barcode: string;
  retailPrice: string;
  wholesalePrice: string;
  minQty: string;
  active: boolean;
}

const wholeOr = (text: string, fallback: number) => {
  const n = parseWholeNumber(text);
  return Number.isNaN(n) ? fallback : n;
};

export function productDraft(input: ProductInput) {
  const sellable = isSellable(input.kind);
  const unitsPerCarton = Math.max(1, wholeOr(input.unitsPerCarton, 1));
  return {
    kind: input.kind,
    name: input.name.trim(),
    unit: input.unit.trim() || DEFAULT_UNIT,
    unitsPerCarton,
    barcode: sellable ? input.barcode.trim() : '',
    retailPrice: sellable ? wholeOr(input.retailPrice, 0) : 0,
    wholesalePrice: sellable && unitsPerCarton > 1 ? wholeOr(input.wholesalePrice, 0) : 0,
    minQty: wholeOr(input.minQty, 0),
    active: input.active,
  };
}

/** Another product already uses this barcode (scans must find exactly one product). */
export function barcodeTaken(products: ProductRecord[], barcode: string, ownId?: string) {
  const code = barcode.trim();
  return code !== '' && products.some((p) => p.barcode === code && p.id !== ownId);
}

/** What is wrong with the form, in words the admin can act on, or null. */
export function productProblem(input: ProductInput, others: ProductRecord[], ownId?: string) {
  const draft = productDraft(input);
  if (draft.name.length < 2) return 'اكتب اسم الصنف.';
  if (barcodeTaken(others, draft.barcode, ownId)) return 'هذا الباركود مسجّل لصنف آخر.';
  if (!isSellable(draft.kind)) return null;
  if (draft.retailPrice === 0 && draft.wholesalePrice === 0) {
    return 'اكتب سعر القطعة أو سعر الكرتونة.';
  }
  return null;
}

export async function saveProduct(
  input: ProductInput,
  id?: string,
  others: ProductRecord[] = [],
): Promise<ProductRecord> {
  const problem = productProblem(input, others, id);
  if (problem) throw new UserError(problem);
  return (await saveRecord('products', { id, ...productDraft(input) })) as ProductRecord;
}
