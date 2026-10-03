import { deviceCode } from './device-code';

/** Receipt numbers: receiptNumber('U', 123) -> "U-000123". */
export const receiptNumber = (devicePrefix: string, sequence: number) =>
  deviceCode(devicePrefix, sequence, 6);

/** Customer numbers: customerCode('A', 12) -> "A-0012". */
export const customerCode = (devicePrefix: string, sequence: number) =>
  deviceCode(devicePrefix, sequence, 4);
