import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { createCustomer, InvalidPhoneError, saveVehicle } from './customer-actions';

const input = { name: ' سامر ', job: '', phone: '0933 111 222', notes: '' };

describe('customer actions', () => {
  beforeEach(freshLaptop);

  it('numbers customers per laptop and stores the phone in one form', async () => {
    const first = await createCustomer(input);
    const second = await createCustomer({ ...input, phone: '0944555666' });
    expect([first.code, second.code]).toEqual(['A-0001', 'A-0002']);
    expect(first).toMatchObject({ name: 'سامر', phone: '963933111222' });
  });

  it('refuses a phone that is not a Syrian mobile', async () => {
    await expect(createCustomer({ ...input, phone: '123' })).rejects.toBeInstanceOf(
      InvalidPhoneError,
    );
    expect(await db.customers.count()).toBe(0);
  });

  it('stores plates in one form', async () => {
    const customer = await createCustomer(input);
    const car = await saveVehicle(customer.id, { plate: ' حلب  ١٢٣ ', color: 'أبيض', size: 'suv' });
    expect(car.plate).toBe('حلب 123');
  });
});
