import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pool } from './client.js';

const dir = resolve(process.cwd(), '../../database/migrations');
const client = await pool.connect();
try {
  await client.query('SELECT pg_advisory_lock(884217)');
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  const entries = (await readdir(dir)).filter(x => /^\d+_[a-z0-9_-]+\.sql$/.test(x)).sort();
  for (const filename of entries) {
    const existing = await client.query('SELECT 1 FROM schema_migrations WHERE filename=$1', [filename]);
    if (existing.rowCount) continue;
    const sql = await readFile(resolve(dir, filename), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`Applied ${filename}`);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }
} finally {
  await client.query('SELECT pg_advisory_unlock(884217)').catch(() => {});
  client.release();
  await pool.end();
}
