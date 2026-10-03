import { Injectable } from '@nestjs/common';
import type { PullResponse, PushResponse, SyncOp } from '@carwash/shared';
import type { AuthUser } from '../../common';
import { groupChanges } from './group-changes';
import { SyncRegistry } from './sync-registry';
import { SyncRepository } from './sync.repository';

const PULL_PAGE_SIZE = 500;

@Injectable()
export class SyncService {
  constructor(
    private readonly registry: SyncRegistry,
    private readonly repo: SyncRepository,
  ) {}

  async push(user: AuthUser, ops: SyncOp[]): Promise<PushResponse> {
    const response: PushResponse = { accepted: [], rejected: [] };
    for (const op of ops) {
      const reason = await this.apply(user, op);
      if (reason) response.rejected.push({ table: op.table, id: op.row.id, reason });
      else response.accepted.push(op.row.id);
    }
    return response;
  }

  async pull(user: AuthUser, since: number, pageSize = PULL_PAGE_SIZE): Promise<PullResponse> {
    const lines = await this.repo.readChanges(since, pageSize + 1);
    const page = lines.slice(0, pageSize);
    const grouped = groupChanges(page, (table) => this.registry.canPull(table, user.role));

    const changes: PullResponse['changes'] = [];
    for (const [table, ids] of grouped) {
      const entry = this.registry.get(table)!;
      const rows = await this.repo.loadRows(entry, ids);
      changes.push({
        table,
        rows: entry.project ? rows.map((r) => entry.project!(r, user)) : rows,
      });
    }
    return { changes, cursor: page.at(-1)?.seq ?? since, hasMore: lines.length > pageSize };
  }

  /** Returns why the op was refused, or null when it was saved (or the server had newer). */
  private async apply(user: AuthUser, op: SyncOp): Promise<string | null> {
    const entry = this.registry.get(op.table);
    if (!entry) return 'unknown_table';
    if (!entry.pushRoles.includes(user.role)) return 'not_allowed';
    const parsed = entry.schema.safeParse(op.row);
    if (!parsed.success) return 'invalid';
    await this.repo.upsert(entry, parsed.data);
    return null;
  }
}
