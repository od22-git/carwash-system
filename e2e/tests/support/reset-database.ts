import { Pool } from 'pg';
import { E2E_DATABASE_URL } from '../../playwright.config';

/** Empties every table, so each spec file starts from a fresh install. */
export async function resetDatabase(): Promise<void> {
  const pool = new Pool({ connectionString: E2E_DATABASE_URL });
  try {
    const { rows } = await pool.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    );
    const tables = rows.map((r) => `"${r.tablename}"`).join(', ');
    if (tables) await pool.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  } finally {
    await pool.end();
  }
}
