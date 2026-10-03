import {
  washPrice,
  type CarSize,
  type PriceMatrix,
  type ServiceRecord,
  type TicketLine,
} from '@carwash/shared';

export interface PricedWash {
  lines: TicketLine[];
  total: number;
  /** Selected services with no price for this car size. */
  missing: string[];
}

/** Turns the selected services into receipt lines, priced for the car's size. */
export function priceWash(
  serviceIds: string[],
  size: CarSize,
  services: ServiceRecord[],
  matrix: PriceMatrix,
): PricedWash {
  const priced = washPrice(serviceIds, size, matrix);
  const nameOf = (id: string) => services.find((s) => s.id === id)?.name ?? '';
  return {
    lines: priced.lines.map((l) => ({
      serviceId: l.serviceId,
      name: nameOf(l.serviceId),
      price: l.price,
    })),
    total: priced.total,
    missing: priced.missing,
  };
}
