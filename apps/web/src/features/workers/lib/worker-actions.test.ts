import { beforeEach, describe, expect, it } from 'vitest';
import { InvalidRecordError } from '../../../core/sync';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { describePay } from './describe-pay';
import { saveWorker, type WorkerInput } from './worker-actions';

const input: WorkerInput = {
  name: 'محمد',
  phone: '0933111222',
  payType: 'commission',
  rate: '٣٠',
  active: true,
};

describe('workers', () => {
  beforeEach(freshLaptop);

  it('saves a commission worker with the rate as a number', async () => {
    const worker = await saveWorker(input);
    expect(worker).toMatchObject({ rate: 30, phone: '963933111222' });
    expect(describePay(worker)).toBe('عمولة 30% من سعر الغسلة');
  });

  it('refuses a commission above 100%', async () => {
    await expect(saveWorker({ ...input, rate: '150' })).rejects.toBeInstanceOf(InvalidRecordError);
  });

  it('describes fixed pay in pounds', async () => {
    const worker = await saveWorker({ ...input, payType: 'fixed_daily', rate: '75,000' });
    expect(describePay(worker)).toBe('75,000 ل.س يومياً');
  });

  it('shows a dash when pay is hidden on the cashier laptop', () => {
    expect(describePay({ payType: undefined, rate: undefined })).toBe('—');
  });
});
