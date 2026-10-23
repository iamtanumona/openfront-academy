-- Sprint 4: progress and formative submissions remain untrusted evidence.
CREATE INDEX IF NOT EXISTS idx_enrollments_track ON enrollments(track_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_date ON submissions(user_id, submitted_at DESC);
CREATE TABLE IF NOT EXISTS audit_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 action TEXT NOT NULL,
 subject_type TEXT NOT NULL,
 subject_id TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_user_id, created_at DESC);
-- Never grant client/anon roles direct access to these backend-owned tables.
