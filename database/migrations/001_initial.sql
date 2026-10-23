-- OpenFront Academy Sprint 1 baseline. All tables are backend-owned.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  display_name VARCHAR(100),
  locale VARCHAR(20) NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  curriculum_version TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0)
);
CREATE TABLE IF NOT EXISTS track_modules (
  track_id TEXT NOT NULL REFERENCES tracks(id),
  module_id TEXT NOT NULL REFERENCES modules(id),
  position INTEGER NOT NULL CHECK (position >= 0),
  PRIMARY KEY (track_id, module_id),
  UNIQUE (track_id, position)
);
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id),
  slug TEXT NOT NULL,
  content_version TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  published BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (module_id, slug),
  UNIQUE (module_id, position)
);
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  exercise_version TEXT NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('html-css-js')),
  passing_score INTEGER NOT NULL DEFAULT 100 CHECK (passing_score BETWEEN 0 AND 100)
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id UUID NOT NULL REFERENCES users(id),
  track_id TEXT NOT NULL REFERENCES tracks(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, track_id)
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  completed_version TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  exercise_version TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  result JSONB NOT NULL,
  grading_method TEXT NOT NULL CHECK (grading_method IN ('client-formative')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  track_id TEXT NOT NULL REFERENCES tracks(id),
  curriculum_version TEXT NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('completion')),
  payload JSONB NOT NULL,
  signature TEXT NOT NULL,
  signing_key_id TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track_id, curriculum_version)
);
CREATE TABLE IF NOT EXISTS certificate_revocations (
  certificate_id UUID PRIMARY KEY REFERENCES certificates(id),
  reason_code TEXT NOT NULL,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, position);
CREATE INDEX IF NOT EXISTS idx_submissions_user_exercise ON submissions(user_id, exercise_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id, issued_at DESC);
