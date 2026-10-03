import {
  normalizeArabicName,
  plateSearchKey,
  toLatinDigits,
  type CustomerRecord,
  type VehicleRecord,
} from '@carwash/shared';

export interface CustomerMatch {
  customer: CustomerRecord;
  vehicles: VehicleRecord[];
}

const MAX_RESULTS = 50;

export function groupVehiclesByCustomer(vehicles: VehicleRecord[]) {
  const map = new Map<string, VehicleRecord[]>();
  for (const v of vehicles) map.set(v.customerId, [...(map.get(v.customerId) ?? []), v]);
  return map;
}

function matcher(query: string) {
  const name = normalizeArabicName(query);
  const digits = toLatinDigits(query).replace(/\D/g, '').replace(/^0/, '');
  const plate = plateSearchKey(query);
  const code = query.trim().toUpperCase();
  return (customer: CustomerRecord, cars: VehicleRecord[]) =>
    normalizeArabicName(customer.name).includes(name) ||
    (digits.length >= 3 && customer.phone.includes(digits)) ||
    customer.code.includes(code) ||
    (plate.length >= 2 && cars.some((car) => plateSearchKey(car.plate).includes(plate)));
}

/**
 * Finds customers by name, phone, customer number or plate, newest first.
 * An empty query lists the most recently updated customers.
 */
export function searchCustomers(
  query: string,
  customers: CustomerRecord[],
  vehicles: VehicleRecord[],
): CustomerMatch[] {
  const byCustomer = groupVehiclesByCustomer(vehicles);
  const matches = query.trim() ? matcher(query) : () => true;
  return customers
    .filter((c) => matches(c, byCustomer.get(c.id) ?? []))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_RESULTS)
    .map((customer) => ({ customer, vehicles: byCustomer.get(customer.id) ?? [] }));
}
