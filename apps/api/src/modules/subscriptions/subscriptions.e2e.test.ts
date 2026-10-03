import {
  pulledRows,
  rejectedReasons,
  syncBase,
  twoLaptops,
  type Laptops,
} from '../../test-utils/two-laptops';

const DAY = 86_400_000;
const terms = { freeWashes: 4, washServiceIds: ['s1'], includesParking: true };

describe('packages and subscriptions', () => {
  let laptops: Laptops;
  beforeAll(async () => {
    laptops = await twoLaptops();
  });
  afterAll(() => laptops.app.close());

  const pkg = (deviceId: string, extra = {}) => ({
    table: 'packages',
    row: {
      ...syncBase('k1', deviceId),
      name: 'شهري',
      price: 500_000,
      durationDays: 30,
      active: true,
      sortOrder: 1,
      ...terms,
      ...extra,
    },
  });
  const sub = (updatedAt: number, status: string, endsAt = 30 * DAY) => ({
    table: 'subscriptions',
    row: {
      ...syncBase('s1', laptops.cashierDevice, updatedAt),
      receiptNo: 'B-000002',
      customerId: 'c1',
      vehicleId: 'v1',
      customerName: 'سامر',
      plate: 'حلب 1',
      packageId: 'k1',
      packageName: 'شهري',
      price: 500_000,
      ...terms,
      startsAt: 0,
      endsAt,
      status,
    },
  });

  it('only the admin defines packages, and an empty package is refused', async () => {
    expect(rejectedReasons(await laptops.cashier.push([pkg(laptops.cashierDevice)]))).toEqual([
      'not_allowed',
    ]);
    const empty = pkg(laptops.adminDevice, { freeWashes: 0, includesParking: false });
    expect(rejectedReasons(await laptops.admin.push([empty]))).toEqual(['invalid']);
    expect((await laptops.admin.push([pkg(laptops.adminDevice)])).body.rejected).toEqual([]);
    const pull = await laptops.cashier.pull(0);
    expect(pulledRows(pull.body, 'packages')).toHaveLength(1);
  });

  it('the cashier sells a package but cannot extend or cancel it afterwards', async () => {
    expect((await laptops.cashier.push([sub(1, 'active')])).body.rejected).toEqual([]);
    const later = await laptops.cashier.push([sub(2, 'active', 60 * DAY), sub(2, 'cancelled')]);
    expect(rejectedReasons(later)).toEqual(['locked', 'admin_only']);
  });

  it('the admin cancels it', async () => {
    expect((await laptops.admin.push([sub(3, 'cancelled')])).body.rejected).toEqual([]);
  });
});
