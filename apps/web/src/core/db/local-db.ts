import type {
  AuditEventRecord,
  CustomerRecord,
  PackageRecord,
  ParkingPlanRecord,
  ParkingSessionRecord,
  ServicePriceRecord,
  ServiceRecord,
  SettingRecord,
  SubscriptionRecord,
  SyncRecord,
  TicketRecord,
  VehicleRecord,
  WorkerPublic,
} from '@carwash/shared';
import Dexie, { type EntityTable } from 'dexie';

/** Any synced row as stored on the laptop. */
export type LocalRecord = SyncRecord & Record<string, unknown>;

export interface OutboxEntry {
  seq?: number;
  table: string;
  rowId: string;
  row: LocalRecord;
  queuedAt: number;
}

export interface SyncErrorEntry {
  id?: number;
  table: string;
  rowId: string;
  reason: string;
  at: number;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

/**
 * The laptop's own database. Screens read only from here, so the app works the same
 * with or without internet. New tables are added with a new version() block; old
 * versions stay so existing laptops upgrade in place.
 */
export class LocalDb extends Dexie {
  meta!: EntityTable<MetaEntry, 'key'>;
  outbox!: EntityTable<OutboxEntry, 'seq'>;
  syncErrors!: EntityTable<SyncErrorEntry, 'id'>;
  settings!: EntityTable<SettingRecord, 'id'>;
  customers!: EntityTable<CustomerRecord, 'id'>;
  vehicles!: EntityTable<VehicleRecord, 'id'>;
  services!: EntityTable<ServiceRecord, 'id'>;
  servicePrices!: EntityTable<ServicePriceRecord, 'id'>;
  /** The cashier's laptop does not receive pay fields. */
  workers!: EntityTable<WorkerPublic, 'id'>;
  tickets!: EntityTable<TicketRecord, 'id'>;
  /** Pulled only on the admin's laptop. */
  auditEvents!: EntityTable<AuditEventRecord, 'id'>;
  parkingPlans!: EntityTable<ParkingPlanRecord, 'id'>;
  parkingSessions!: EntityTable<ParkingSessionRecord, 'id'>;
  packages!: EntityTable<PackageRecord, 'id'>;
  subscriptions!: EntityTable<SubscriptionRecord, 'id'>;

  constructor(name = 'carwash') {
    super(name);
    this.version(1).stores({
      meta: 'key',
      outbox: '++seq, table, [table+rowId]',
      syncErrors: '++id',
      settings: 'id',
    });
    this.version(2).stores({
      customers: 'id, phone, code',
      vehicles: 'id, customerId, plate',
      services: 'id',
      servicePrices: 'id, serviceId',
      workers: 'id',
    });
    this.version(3).stores({
      tickets: 'id, status, arrivedAt, customerId, workerId',
      auditEvents: 'id, createdAt',
    });
    this.version(4).stores({
      tickets: 'id, status, arrivedAt, customerId, workerId, subscriptionId',
      parkingPlans: 'id',
      parkingSessions: 'id, status, enteredAt, vehicleId',
      packages: 'id',
      subscriptions: 'id, vehicleId, createdAt',
    });
  }
}

export const db = new LocalDb();
