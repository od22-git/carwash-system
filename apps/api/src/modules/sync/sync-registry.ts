import { Injectable } from '@nestjs/common';
import type { Role } from '@carwash/shared';
import type { SyncEntry } from './sync-entry';

/** Feature modules register their tables here in onModuleInit(). Sync itself knows no features. */
@Injectable()
export class SyncRegistry {
  private readonly entries = new Map<string, SyncEntry>();

  register(entry: SyncEntry): void {
    if (this.entries.has(entry.name)) {
      throw new Error(`Sync table "${entry.name}" is registered twice`);
    }
    this.entries.set(entry.name, entry);
  }

  get(name: string): SyncEntry | undefined {
    return this.entries.get(name);
  }

  canPull(name: string, role: Role): boolean {
    return this.entries.get(name)?.pullRoles.includes(role) ?? false;
  }
}
