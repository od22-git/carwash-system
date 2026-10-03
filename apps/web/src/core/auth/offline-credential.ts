/**
 * A salted hash of the password, kept on the laptop so the same person can log in again
 * when there is no internet. The password itself is never stored.
 */
export interface OfflineCredential {
  salt: string;
  hash: string;
  iterations: number;
}

const ITERATIONS = 100_000;

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text: string) => new Uint8Array(Array.from(atob(text), (c) => c.charCodeAt(0)));

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export async function createCredential(password: string): Promise<OfflineCredential> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    salt: toBase64(salt),
    hash: await derive(password, salt, ITERATIONS),
    iterations: ITERATIONS,
  };
}

export async function verifyCredential(
  cred: OfflineCredential,
  password: string,
): Promise<boolean> {
  return (await derive(password, fromBase64(cred.salt), cred.iterations)) === cred.hash;
}
