import {
  pulledRows,
  rejectedReasons,
  syncBase,
  twoLaptops,
  type Laptops,
} from '../../test-utils/two-laptops';

describe('garage: plans and parked cars', () => {
  let laptops: Laptops;
  beforeAll(async () => {
    laptops = await twoLaptops();
  });
  afterAll(() => laptops.app.close());

  const plan = (deviceId: string) => ({
    table: 'parkingPlans',
    row: { ...syncBase('p1', deviceId), name: 'يوم', durationHours: 24, price: 150_000 },
  });
  const session = (updatedAt: number, status: string) => ({
    table: 'parkingSessions',
    row: {
      ...syncBase('g1', laptops.cashierDevice, updatedAt),
      receiptNo: 'B-000001',
      customerId: 'c1',
      vehicleId: 'v1',
      customerName: 'سامر',
      plate: 'حلب 1',
      planName: 'بالساعة',
      plan: { kind: 'hourly' },
      status,
      enteredAt: 1,
    },
  });
  const withOrder = (op: ReturnType<typeof plan>) => ({
    ...op,
    row: { ...op.row, sortOrder: 1, active: true },
  });

  it('only the admin sets plans, and the cashier receives them', async () => {
    const byCashier = await laptops.cashier.push([withOrder(plan(laptops.cashierDevice))]);
    expect(rejectedReasons(byCashier)).toEqual(['not_allowed']);
    const byAdmin = await laptops.admin.push([withOrder(plan(laptops.adminDevice))]);
    expect(byAdmin.body.rejected).toEqual([]);
    const pull = await laptops.cashier.pull(0);
    expect(pulledRows(pull.body, 'parkingPlans')).toHaveLength(1);
  });

  it('the cashier parks a car and lets it out, then cannot touch the receipt', async () => {
    const parked = await laptops.cashier.push([session(1, 'parked'), session(2, 'left')]);
    expect(parked.body.rejected).toEqual([]);
    const later = await laptops.cashier.push([session(3, 'parked'), session(3, 'cancelled')]);
    expect(rejectedReasons(later)).toEqual(['locked', 'admin_only']);
  });

  it('a retry of the same version is accepted without a change', async () => {
    const retry = await laptops.cashier.push([session(2, 'left')]);
    expect(retry.body).toEqual({ accepted: ['g1'], rejected: [] });
  });

  it('the admin cancels a garage receipt', async () => {
    const res = await laptops.admin.push([session(4, 'cancelled')]);
    expect(res.body.rejected).toEqual([]);
  });
});
