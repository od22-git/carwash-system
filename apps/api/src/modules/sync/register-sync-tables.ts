import type { Provider } from '@nestjs/common';
import type { SyncEntry } from './sync-entry';
import { SyncRegistry } from './sync-registry';

/**
 * Put in a feature module's providers to plug its tables into sync:
 *   @Module({ imports: [SyncModule], providers: [registerSyncTables(customersSync)] })
 */
export function registerSyncTables(...entries: SyncEntry[]): Provider {
  return {
    provide: Symbol(`sync-tables:${entries.map((e) => e.name).join(',')}`),
    inject: [SyncRegistry],
    useFactory: (registry: SyncRegistry) => {
      entries.forEach((entry) => registry.register(entry));
      return true;
    },
  };
}
