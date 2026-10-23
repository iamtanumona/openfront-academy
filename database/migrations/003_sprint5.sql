-- Sprint 5: certificate integrity and audit trail.
CREATE TABLE IF NOT EXISTS credential_audit_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 certificate_id UUID NOT NULL REFERENCES certificates(id),
 actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 action TEXT NOT NULL CHECK (action IN ('issued','revoked')),
 reason_code TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credential_audit_certificate ON credential_audit_events(certificate_id, created_at);
-- Restrict access to backend DB roles; do not expose through Supabase anon/authenticated grants.
