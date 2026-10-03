import {
  DEFAULT_GARAGE_SETTINGS,
  type CustomerRecord,
  type TicketRecord,
  type VehicleRecord,
} from '@carwash/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../core/db';
import { freshLaptop } from '../../../core/sync/test-helpers';
import { priceWash } from './price-wash';
import { cancelTicket, createTicket, deliver, markNotified, startWashing } from './ticket-actions';
import { busyWorkerIds, waitingCounts } from './worker-load';

const base = { createdAt: 1, updatedAt: 1, deviceId: 'd', deletedAt: null };
const customer = {
  ...base,
  id: 'c1',
  code: 'A-0001',
  name: 'سامر',
  job: '',
  phone: '963933111222',
  notes: '',
} as CustomerRecord;
const vehicle = {
  ...base,
  id: 'v1',
  customerId: 'c1',
  plate: 'حلب 1',
  color: '',
  size: 'suv',
} as VehicleRecord;
const services = [
  { ...base, id: 's1', name: 'خارجي', sortOrder: 1, active: true },
  { ...base, id: 's2', name: 'سفلي', sortOrder: 2, active: true },
];
const matrix = { s1: { suv: 30_000 }, s2: { suv: 20_000, sedan: 15_000 } };
const owner = { id: 'u1', name: 'المالك', username: 'owner', role: 'admin' as const };

const newTicket = (workerBusy = false) =>
  createTicket({
    customer,
    vehicle,
    lines: priceWash(['s1', 's2'], 'suv', services, matrix).lines,
    workerId: 'w1',
    requestedWorker: workerBusy,
    workerBusy,
    notes: '',
  });

describe('wash tickets', () => {
  beforeEach(freshLaptop);

  it('prices the selected services for the car size, with names', () => {
    const priced = priceWash(['s1', 's2'], 'suv', services, matrix);
    expect(priced.total).toBe(50_000);
    expect(priced.lines.map((l) => l.name)).toEqual(['خارجي', 'سفلي']);
    expect(priceWash(['s1'], 'sedan', services, matrix).missing).toEqual(['s1']);
  });

  it('numbers receipts per laptop and starts washing when the worker is free', async () => {
    const first = await newTicket();
    const second = await newTicket();
    expect([first.receiptNo, second.receiptNo]).toEqual(['A-000001', 'A-000002']);
    expect(first).toMatchObject({
      status: 'washing',
      washTotal: 50_000,
      total: 50_000,
      plate: 'حلب 1',
    });
  });

  it('waits when the requested worker is busy', async () => {
    const ticket = await newTicket(true);
    expect(ticket).toMatchObject({ status: 'waiting', startedAt: null });
    expect((await startWashing(ticket)).status).toBe('washing');
  });

  it('adds the garage fee when the customer comes 4 hours after the notice', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-04T10:00:00Z'), toFake: ['Date'] });
    const notified = await markNotified(await newTicket());
    vi.setSystemTime(new Date('2026-10-04T14:15:00Z'));
    const delivered = await deliver(notified, DEFAULT_GARAGE_SETTINGS);
    vi.useRealTimers();
    expect(delivered).toMatchObject({
      status: 'delivered',
      garageFee: 40_000,
      garageHours: 4,
      total: 90_000,
    });
  });

  it('refuses to skip steps', async () => {
    const ticket = { ...(await newTicket(true)) } as TicketRecord;
    await expect(markNotified(ticket)).rejects.toThrow();
  });

  it('logs who cancelled a receipt and why', async () => {
    const ticket = await newTicket();
    await cancelTicket(ticket, 'خطأ في التسجيل', owner);
    expect((await db.tickets.get(ticket.id))?.status).toBe('cancelled');
    const [event] = await db.auditEvents.toArray();
    expect(event).toMatchObject({
      action: 'ticket.cancel',
      userName: 'المالك',
      reason: 'خطأ في التسجيل',
    });
  });

  it('knows which workers are busy and how many cars wait for each', () => {
    const open = [
      { workerId: 'w1', status: 'washing' as const, arrivedAt: 1 },
      { workerId: 'w1', status: 'waiting' as const, arrivedAt: 2 },
      { workerId: 'w2', status: 'grace' as const, arrivedAt: 3 },
    ];
    expect([...busyWorkerIds(open)]).toEqual(['w1']);
    expect(waitingCounts(open).get('w1')).toBe(1);
  });
});
