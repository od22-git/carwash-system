import { defineConfig } from '@playwright/test';

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgres://carwash:carwash@localhost:5432/carwash_e2e';

/**
 * Runs the real API (built) and the real website (production build with the offline
 * service worker) against a throwaway database. Build first: pnpm build.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://localhost:4173', locale: 'ar' },
  webServer: [
    {
      command: 'node ../apps/api/dist/main.js',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: false,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_URL: E2E_DATABASE_URL,
        JWT_SECRET: 'e2e-secret-that-is-at-least-32-characters-long',
        CORS_ORIGINS: 'http://localhost:4173',
      },
    },
    {
      command: 'pnpm --filter @carwash/web preview',
      url: 'http://localhost:4173',
      reuseExistingServer: false,
    },
  ],
});
