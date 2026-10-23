# Sprint 4 — Authenticated learner progress

## Setup
1. Create a Supabase project. Enable email OTP/magic links and configure the redirect allowlist to include `http://localhost:4321/dashboard` (plus your deployed dashboard URL).
2. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env` and fill in the Supabase project values. **Never use a service-role key in the browser.**
3. Use Supabase's asymmetric JWT signing configuration compatible with the JWKS endpoint. The API validates issuer, audience, signature, expiry and subject. Legacy shared-secret signing is not supported by this starter.
4. Start Postgres, run `pnpm db:migrate` and `pnpm db:seed`. To use progress, seed the lessons/modules/exercises as well: `pnpm db:seed:curriculum`.
5. Run `pnpm dev`, visit `/dashboard`, request a sign-in link, and enroll in Frontend Foundations.

## Security
- No browser-to-Postgres direct access; backend owns tables.
- Bearer tokens are verified by JWKS. API derives user ID exclusively from token `sub`.
- All database queries are parameterized. Enrollment, progress and submissions are scoped to authenticated user ID.
- Formative submissions are **not trusted examination evidence**. They are not used for certification.
- Local storage of auth sessions is managed by Supabase JS. This requires strict XSS prevention, CSP hardening and dependency review before production. For higher-assurance deployments, use a backend-for-frontend with HttpOnly secure cookies.
- Apply request rate limits and audit logs before production. The example has validation and authentication but does not yet include a distributed rate limiter.

## Tests
Run `pnpm --filter @ofa/api test` for authorization and validation tests. Run `pnpm db:migrate` against a disposable Postgres database before release. Real Supabase email flow needs manual staging E2E verification.

## Operational note
Do not claim that a self-reported lesson completion proves skill mastery. Certificate issuance remains Sprint 5.
