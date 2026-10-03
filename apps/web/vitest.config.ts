import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // A real IndexedDB in memory, so the laptop database is tested for real.
    setupFiles: ['fake-indexeddb/auto'],
  },
});
