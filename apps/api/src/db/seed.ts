import { pool } from './client.js';

try {
  await pool.query(`INSERT INTO tracks (id, slug, title, curriculum_version, published)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO NOTHING`, ['frontend-foundations', 'frontend-foundations', 'Frontend Foundations', '1.0.0', true]);
  console.log('Seed complete');
} finally {
  await pool.end();
}
