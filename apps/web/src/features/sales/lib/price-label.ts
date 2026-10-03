import { formatSYP, type ProductRecord } from '@carwash/shared';

/** "3,000 ل.س", or "650,000 ل.س للكرتونة" for a product sold only by the carton. */
export const priceLabel = (p: Pick<ProductRecord, 'retailPrice' | 'wholesalePrice'>) =>
  p.retailPrice ? formatSYP(p.retailPrice) : `${formatSYP(p.wholesalePrice)} للكرتونة`;
