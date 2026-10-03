/** A garage (parking) session: the car is in, it left (paid), or the admin cancelled it. */
export const PARKING_STATUSES = ['parked', 'left', 'cancelled'] as const;
export type ParkingStatus = (typeof PARKING_STATUSES)[number];

export const PARKING_STATUS_LABELS: Record<ParkingStatus, string> = {
  parked: 'في الكراج',
  left: 'خرجت',
  cancelled: 'ملغاة',
};

const NEXT: Record<ParkingStatus, ParkingStatus[]> = {
  parked: ['left', 'cancelled'],
  left: ['cancelled'],
  cancelled: [],
};

export const canMoveParking = (from: ParkingStatus, to: ParkingStatus) => NEXT[from].includes(to);
