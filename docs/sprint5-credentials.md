# Sprint 5 credentials

This release issues **self-paced completion** credentials only. Learner-submitted progress and practice scores are not independently proctored or tamper-proof.

## Setup

1. Apply `003_sprint5.sql` after earlier migrations.
2. Generate a development-only Ed25519 key using `node infrastructure/scripts/generate-dev-signing-key.mjs`.
3. Set `CREDENTIAL_PRIVATE_KEY_PEM` (escaped newlines supported), `CREDENTIAL_KEY_ID`, and `PUBLIC_WEB_URL` on the API. Never commit the private key.
4. Ensure the database track `curriculum_version` matches the published track YAML (`0.2.0`).
5. Visit `/dashboard` to request issuance; `/verify/?id=<uuid>` verifies public status.

## Operational cautions

- The server does not mount a public revocation endpoint: use the backend credential store via a privileged, audited maintenance command; never expose revocation to arbitrary learners.
- Retain historical public keys for key rotation; the current starter verifies only the active key, so rotation requires extending the verifier before rotating production keys.
- The eligibility query counts all published lessons in the track's modules. It does not yet enforce required-module flags or capstone rules. Do not issue credentials for tracks that require capstones.
- `credential_audit_events` records issuance/revocation in the same transaction.
- Perform live PostgreSQL integration tests and review certificate-signing key custody before production.
