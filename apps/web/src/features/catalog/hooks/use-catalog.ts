import { buildPriceMatrix, type PriceMatrix, type ServiceRecord } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

export interface Catalog {
  /** All services in display order, including paused ones. */
  services: ServiceRecord[];
  matrix: PriceMatrix;
  loading: boolean;
}

/** Services and their prices per car size, live from the laptop database. */
export function useCatalog(): Catalog {
  const services = useActiveRows(() => db.services.toArray());
  const prices = useActiveRows(() => db.servicePrices.toArray());
  return {
    services: [...(services ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    matrix: buildPriceMatrix(prices ?? []),
    loading: services === undefined || prices === undefined,
  };
}
