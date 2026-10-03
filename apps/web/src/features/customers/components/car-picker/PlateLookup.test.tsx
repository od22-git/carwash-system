// @vitest-environment jsdom
import type { CustomerRecord, VehicleRecord } from '@carwash/shared';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlateLookup } from './PlateLookup';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'd1', deletedAt: null };
const customer: CustomerRecord = {
  ...base,
  id: 'c1',
  code: 'A-0001',
  name: 'هالة',
  job: '',
  phone: '963944000202',
  notes: '',
};
const vehicle: VehicleRecord = {
  ...base,
  id: 'v1',
  customerId: 'c1',
  plate: 'حمص 202',
  color: '',
  size: 'sedan',
};

function setup(loading: boolean) {
  const onPick = vi.fn();
  const props = { customers: [customer], onPick, onNewCar: vi.fn() };
  const view = render(
    <PlateLookup {...props} vehicles={loading ? [] : [vehicle]} loading={loading} />,
  );
  const arrive = () =>
    view.rerender(<PlateLookup {...props} vehicles={[vehicle]} loading={false} />);
  return { onPick, arrive };
}

describe('PlateLookup', () => {
  afterEach(cleanup);

  it('Enter on a known plate picks the car', async () => {
    const { onPick } = setup(false);
    await userEvent.type(screen.getByLabelText('رقم اللوحة'), 'حمص 202{Enter}');
    expect(onPick).toHaveBeenCalledWith(vehicle, customer);
  });

  it('Enter pressed while the car list is loading picks the car once it arrives', async () => {
    const { onPick, arrive } = setup(true);
    await userEvent.type(screen.getByLabelText('رقم اللوحة'), 'حمص 202{Enter}');
    expect(onPick).not.toHaveBeenCalled();
    arrive();
    expect(onPick).toHaveBeenCalledWith(vehicle, customer);
  });

  it('does not offer "new car" until the search is complete', async () => {
    const { arrive } = setup(true);
    await userEvent.type(screen.getByLabelText('رقم اللوحة'), 'حمص 202');
    expect(screen.queryByRole('button', { name: 'سيارة جديدة بهذه اللوحة' })).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('جارٍ البحث');
    arrive();
    expect(screen.queryByRole('button', { name: 'سيارة جديدة بهذه اللوحة' })).toBeNull();
  });

  it('offers "new car" for an unknown plate', async () => {
    setup(false);
    await userEvent.type(screen.getByLabelText('رقم اللوحة'), 'حلب 999');
    expect(screen.getByRole('button', { name: 'سيارة جديدة بهذه اللوحة' })).toBeTruthy();
  });

  it('typing after Enter cancels the waiting pick', async () => {
    const { onPick, arrive } = setup(true);
    const input = screen.getByLabelText('رقم اللوحة');
    await userEvent.type(input, 'حمص 202{Enter}');
    await userEvent.type(input, '3');
    arrive();
    expect(onPick).not.toHaveBeenCalled();
  });
});
