import {
  defaultSaleMode,
  saleLine,
  type ProductRecord,
  type SaleLine,
  type SaleMode,
} from '@carwash/shared';

/** One cart line before pricing: a product, sold by the piece or by the carton. */
export interface CartItem {
  productId: string;
  mode: SaleMode;
  quantity: number;
}

export type CartAction =
  | { type: 'add'; product: ProductRecord; mode?: SaleMode }
  | { type: 'quantity'; key: string; quantity: number }
  | { type: 'mode'; key: string; mode: SaleMode }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

export const itemKey = (item: Pick<CartItem, 'productId' | 'mode'>) =>
  `${item.productId}:${item.mode}`;

/** Adds to an existing line of the same product and mode, or appends a new line. */
function merge(cart: CartItem[], item: CartItem): CartItem[] {
  const i = cart.findIndex((it) => itemKey(it) === itemKey(item));
  if (i < 0) return [...cart, item];
  return cart.map((it, j) => (j === i ? { ...it, quantity: it.quantity + item.quantity } : it));
}

export function cartReducer(cart: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const mode = action.mode ?? defaultSaleMode(action.product);
      return merge(cart, { productId: action.product.id, mode, quantity: 1 });
    }
    case 'quantity':
      return cart.map((it) =>
        itemKey(it) === action.key ? { ...it, quantity: Math.max(1, action.quantity) } : it,
      );
    case 'mode': {
      const item = cart.find((it) => itemKey(it) === action.key);
      if (!item || item.mode === action.mode) return cart;
      const rest = cart.filter((it) => it !== item);
      return merge(rest, { ...item, mode: action.mode });
    }
    case 'remove':
      return cart.filter((it) => itemKey(it) !== action.key);
    case 'clear':
      return [];
  }
}

/** Prices the cart with today's prices. Lines whose product is gone or unpriced are left out. */
export function cartLines(cart: CartItem[], products: ProductRecord[]): SaleLine[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return [];
    try {
      return [saleLine(product, item.mode, item.quantity)];
    } catch {
      return [];
    }
  });
}
