import { describe, expect, it } from 'vitest';
import { createCredential, verifyCredential } from './offline-credential';

describe('offline credential', () => {
  it('accepts the right password and rejects others', async () => {
    const cred = await createCredential('secret123');
    expect(await verifyCredential(cred, 'secret123')).toBe(true);
    expect(await verifyCredential(cred, 'secret124')).toBe(false);
  });

  it('never stores the password itself', async () => {
    const cred = await createCredential('secret123');
    expect(JSON.stringify(cred)).not.toContain('secret123');
  });
});
