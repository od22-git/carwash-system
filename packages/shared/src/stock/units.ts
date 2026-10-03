/** 3 cartons of 12 + 5 loose pieces -> 41 units. */
export function toUnits(cartons: number, pieces: number, unitsPerCarton: number): number {
  return cartons * unitsPerCarton + pieces;
}

/** 41 units, 12 per carton -> { cartons: 3, pieces: 5 }. */
export function splitUnits(units: number, unitsPerCarton: number) {
  if (unitsPerCarton <= 1) return { cartons: 0, pieces: units };
  return { cartons: Math.floor(units / unitsPerCarton), pieces: units % unitsPerCarton };
}
