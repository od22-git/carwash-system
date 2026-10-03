import { execSync } from 'node:child_process';
import { Pool } from 'pg';
import { E2E_DATABASE_URL } from './playwright.config';

/** Fresh database for every run: drop everything, then apply the real migrations. */
export default async function globalSetup() {
  const pool = new Pool({ connectionString: E2E_DATABASE_URL });
  try {
    await pool.query(
      'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE;',
    );
    await pool.query('CREATE SCHEMA public;');
  } finally {
    await pool.end();
  }
  execSync('pnpm --filter @carwash/api db:migrate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  });
}
