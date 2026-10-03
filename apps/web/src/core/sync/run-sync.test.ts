import { beforeEach, describe, expect, it } from 'vitest';
import { db, getMeta } from '../db';
import { runSync } from './run-sync';
import { saveRecord } from './save-record';
import { getSyncPhase } from './sync-state';
import { fakeServer, freshLaptop, garageDraft } from './test-helpers';

const emptyPull = (cursor: number) => ({ changes: [], cursor, hasMore: false });

describe('runSync', () => {
  beforeEach(freshLaptop);

  it('pushes the outbox, empties it, then pulls and saves the cursor', async () => {
    await saveRecord('settings', garageDraft(5));
    const calls = fakeServer((path) =>
      path === '/sync/push' ? { accepted: ['garage'], rejected: [] } : emptyPull(42),
    );

    await runSync();

    expect(calls.map((c) => c.path)).toEqual(['/sync/push', '/sync/pull?since=0']);
    expect(await db.outbox.count()).toBe(0);
    expect(await getMeta('syncCursor')).toBe(42);
    expect(getSyncPhase()).toBe('idle');
  });

  it('keeps refused changes visible for the admin', async () => {
    await saveRecord('settings', garageDraft());
    fakeServer((path) =>
      path === '/sync/push'
        ? { accepted: [], rejected: [{ table: 'settings', id: 'garage', reason: 'not_allowed' }] }
        : emptyPull(0),
    );
    await runSync();
    expect(await db.syncErrors.count()).toBe(1);
    expect(await db.outbox.count()).toBe(0);
  });

  it('follows pages until the server says there is no more', async () => {
    let page = 0;
    const calls = fakeServer(() => ({ changes: [], cursor: ++page * 10, hasMore: page < 3 }));
    await runSync();
    expect(calls.map((c) => c.path)).toEqual([
      '/sync/pull?since=0',
      '/sync/pull?since=10',
      '/sync/pull?since=20',
    ]);
  });

  it('marks the laptop offline when the server cannot be reached, and keeps the work', async () => {
    await saveRecord('settings', garageDraft());
    globalThis.fetch = (() => Promise.reject(new TypeError('network'))) as typeof fetch;
    await runSync();
    expect(getSyncPhase()).toBe('offline');
    expect(await db.outbox.count()).toBe(1);
  });

  it('asks to log in again when the server rejects the token', async () => {
    globalThis.fetch = (async () => new Response('{}', { status: 401 })) as typeof fetch;
    await runSync();
    expect(getSyncPhase()).toBe('login-expired');
  });
});
