import { db, setMeta } from '../db';

export const DEVICE = { id: '11111111-1111-1111-1111-111111111111', name: 'test', prefix: 'A' };

/** Empty database with a registered laptop and a logged-in admin. */
export async function freshLaptop(): Promise<void> {
  await db.delete();
  await db.open();
  await setMeta('device', DEVICE);
  await setMeta('session', {
    token: 't',
    user: { id: 'u1', name: 'owner', username: 'owner', role: 'admin' },
  });
}

/** Replaces fetch with a fake server; returns the requests it received. */
export function fakeServer(handler: (path: string, body: unknown) => unknown) {
  const calls: { path: string; body: unknown }[] = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    const path = url.replace('/api', '');
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    calls.push({ path, body });
    return new Response(JSON.stringify(handler(path, body)), { status: 200 });
  }) as typeof fetch;
  return calls;
}
