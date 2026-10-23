import type { Pool, PoolClient } from 'pg';
import type { ProgressStore, EnrollmentInput, ProgressInput, SubmissionInput } from '../progress.js';

async function ensureUser(client: PoolClient, userId: string) {
 await client.query('INSERT INTO users(id) VALUES($1) ON CONFLICT(id) DO NOTHING', [userId]);
}
export function postgresProgressStore(pool: Pool): ProgressStore {
 return {
  async profile(userId) {
   const result = await pool.query('SELECT id, display_name AS "displayName", locale, created_at AS "createdAt" FROM users WHERE id=$1', [userId]);
   return result.rows[0] ?? { id: userId, displayName: null, locale: 'en' };
  },
  async enroll(userId, input: EnrollmentInput) {
   const client = await pool.connect();
   try {
    await client.query('BEGIN');
    const track = await client.query('SELECT id FROM tracks WHERE id=$1 AND published=true', [input.trackId]);
    if (!track.rowCount) throw new DomainError('TRACK_NOT_FOUND', 404);
    await ensureUser(client, userId);
    const result = await client.query('INSERT INTO enrollments(user_id,track_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING track_id', [userId,input.trackId]);
    await client.query('COMMIT');
    return { created: Boolean(result.rowCount), trackId: input.trackId };
   } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  },
  async progress(userId) {
   const [enrollments, lessons] = await Promise.all([
    pool.query('SELECT e.track_id AS "trackId", t.title, e.enrolled_at AS "enrolledAt" FROM enrollments e JOIN tracks t ON t.id=e.track_id WHERE e.user_id=$1 ORDER BY e.enrolled_at DESC',[userId]),
    pool.query('SELECT lesson_id AS "lessonId", completed_version AS "contentVersion", completed_at AS "completedAt" FROM lesson_progress WHERE user_id=$1 ORDER BY completed_at DESC',[userId])
   ]);
   return { enrollments: enrollments.rows, lessons: lessons.rows };
  },
  async completeLesson(userId, lessonId, input: ProgressInput) {
   const client = await pool.connect();
   try {
    await client.query('BEGIN');
    const lesson = await client.query('SELECT l.id FROM lessons l WHERE l.id=$1 AND l.content_version=$2 AND l.published=true AND EXISTS (SELECT 1 FROM track_modules tm JOIN enrollments e ON e.track_id=tm.track_id WHERE tm.module_id=l.module_id AND e.user_id=$3)',[lessonId,input.contentVersion,userId]);
    if (!lesson.rowCount) throw new DomainError('LESSON_NOT_AVAILABLE', 404);
    await ensureUser(client,userId);
    const result = await client.query(`INSERT INTO lesson_progress(user_id,lesson_id,completed_version) VALUES($1,$2,$3)
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed_version=EXCLUDED.completed_version, completed_at=now()
      RETURNING lesson_id AS "lessonId", completed_version AS "contentVersion", completed_at AS "completedAt"`,[userId,lessonId,input.contentVersion]);
    await client.query('COMMIT'); return result.rows[0];
   } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  },
  async submit(userId, input: SubmissionInput) {
   const client=await pool.connect();
   try {
    await client.query('BEGIN');
    const exercise=await client.query(`SELECT x.id FROM exercises x JOIN lessons l ON l.id=x.lesson_id
      WHERE x.id=$1 AND x.exercise_version=$2 AND l.published=true`,[input.exerciseId,input.exerciseVersion]);
    if (!exercise.rowCount) throw new DomainError('EXERCISE_NOT_FOUND',404);
    await ensureUser(client,userId);
    const result=await client.query(`INSERT INTO submissions(user_id,exercise_id,exercise_version,score,passed,result,grading_method)
      VALUES($1,$2,$3,$4,$5,$6::jsonb,'client-formative') RETURNING id AS "submissionId", score, passed`,
      [userId,input.exerciseId,input.exerciseVersion,input.score,input.passed,JSON.stringify(input.results)]);
    await client.query('COMMIT');
    return { ...result.rows[0], gradingMethod:'client-formative', trustedAssessment:false };
   } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }
 };
}
export class DomainError extends Error { constructor(public code: string, public status: 404 | 409 | 422) { super(code); } }
