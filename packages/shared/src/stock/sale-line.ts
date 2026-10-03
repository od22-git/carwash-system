import type { SYP } from '../common';
import { isSellable } from './product-kind';
import type { ProductRecord } from './product-record';
import type { SaleLine, SaleMode } from './sale-record';

type Priced = Pick<
  ProductRecord,
  'id' | 'name' | 'kind' | 'unitsPerCarton' | 'retailPrice' | 'wholesalePrice'
>;

/** Price of one piece or one carton, or null when the product is not sold that way. */
export function sellPrice(product: Priced, mode: SaleMode): SYP | null {
  if (!isSellable(product.kind)) return null;
  if (mode === 'piece') return product.retailPrice > 0 ? product.retailPrice : null;
  return product.unitsPerCarton > 1 && product.wholesalePrice > 0 ? product.wholesalePrice : null;
}

/** The way a product is offered first at the counter: by the piece when it can be. */
export const defaultSaleMode = (product: Priced): SaleMode =>
  sellPrice(product, 'piece') !== null ? 'piece' : 'carton';

/** One receipt line. Throws when the product cannot be sold this way. */
export function saleLine(product: Priced, mode: SaleMode, quantity: number): SaleLine {
  const unitPrice = sellPrice(product, mode);
  if (unitPrice === null || !isSellable(product.kind)) {
    throw new Error(`${product.name} is not sold by the ${mode}`);
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Quantity must be a whole number above 0, got ${quantity}`);
  }
  return {
    productId: product.id,
    name: product.name,
    kind: product.kind,
    mode,
    quantity,
    units: mode === 'carton' ? quantity * product.unitsPerCarton : quantity,
    unitPrice,
    total: unitPrice * quantity,
  };
}

export const saleTotal = (lines: Pick<SaleLine, 'total'>[]): SYP =>
  lines.reduce((sum, line) => sum + line.total, 0);
