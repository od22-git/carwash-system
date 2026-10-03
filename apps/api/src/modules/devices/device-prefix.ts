const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function* prefixes() {
  for (const a of LETTERS) yield a;
  for (const a of LETTERS) for (const b of LETTERS) yield a + b;
}

/** First free receipt prefix: A, B, ... Z, then AA, AB, ... */
export function nextDevicePrefix(used: Iterable<string>): string {
  const taken = new Set(used);
  for (const prefix of prefixes()) if (!taken.has(prefix)) return prefix;
  throw new Error('No receipt prefix left');
}
