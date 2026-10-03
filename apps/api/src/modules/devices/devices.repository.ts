import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type Database } from '../../database';
import { devices, type DeviceRow } from './devices.schema';

@Injectable()
export class DevicesRepository {
  constructor(@Inject(DB) private readonly db: Database) {}

  async usedPrefixes(): Promise<string[]> {
    const rows = await this.db.select({ prefix: devices.prefix }).from(devices);
    return rows.map((r) => r.prefix);
  }

  async insert(values: { name: string; prefix: string; registeredBy: string }): Promise<DeviceRow> {
    const [row] = await this.db.insert(devices).values(values).returning();
    return row!;
  }

  async findById(id: string): Promise<DeviceRow | undefined> {
    const [row] = await this.db.select().from(devices).where(eq(devices.id, id));
    return row;
  }

  async touch(id: string): Promise<void> {
    await this.db.update(devices).set({ lastSeenAt: Date.now() }).where(eq(devices.id, id));
  }
}
