import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const testEnv = {
  NODE_ENV: 'test',
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ?? 'postgres://carwash:carwash@localhost:5432/carwash_test',
  JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long',
};
// Also needed by globalSetup, which runs outside the test workers.
Object.assign(process.env, testEnv);

// SWC keeps decorator metadata, which NestJS needs for dependency injection.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    fileParallelism: false,
    env: testEnv,
    globalSetup: ['./src/test-utils/global-setup.ts'],
  },
});
