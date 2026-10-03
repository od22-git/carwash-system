import { nextDevicePrefix } from './device-prefix';

describe('nextDevicePrefix', () => {
  it('starts at A and skips used letters', () => {
    expect(nextDevicePrefix([])).toBe('A');
    expect(nextDevicePrefix(['A', 'C'])).toBe('B');
  });

  it('moves to two letters after Z', () => {
    const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(nextDevicePrefix(all)).toBe('AA');
  });
});
