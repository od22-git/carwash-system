import type { SYP } from '../common';

export interface FeeResult {
  fee: SYP;
  billedHours: number;
}

export const NO_FEE: FeeResult = { fee: 0, billedHours: 0 };
