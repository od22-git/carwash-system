import type { WorkerPublic } from '@carwash/shared';
import { db, useActiveRows } from '../../../core/db';

/** All workers (including stopped ones), sorted by name. */
export function useWorkers(): { workers: WorkerPublic[]; loading: boolean } {
  const rows = useActiveRows(() => db.workers.toArray());
  return {
    workers: [...(rows ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    loading: rows === undefined,
  };
}

/** Workers who can be given a car today. */
export function useActiveWorkers(): WorkerPublic[] {
  return useWorkers().workers.filter((w) => w.active);
}
