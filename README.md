# OpenFront Academy

Free, open-source frontend learning platform. This repository is the **Sprint 1 + Sprint 2 starter**: Astro web, Hono API, PostgreSQL migrations, shared TypeScript contracts, CI, and Docker. Sprint 2 adds curriculum validation, MDX lessons, accessible learning path navigation, and eight initial HTML/CSS lessons. It is not yet a full learning platform or production deployment.

## Prerequisites

- Node.js 22 LTS (or a supported newer LTS)
- Corepack and pnpm 10.18.3
- Docker with Compose plugin

## Quick start

```bash
corepack enable
corepack prepare pnpm@10.18.3 --activate
pnpm install
docker compose up -d postgres
cp .env.example apps/api/.env
cp .env.example apps/web/.env
pnpm db:migrate
pnpm dev
```

Web: http://localhost:4321; API: http://localhost:3001/v1/health/live.

Alternatively run the API and PostgreSQL via `docker compose up --build -d`, then run the web app using `pnpm --filter @ofa/web dev`. Don't run the local API and Compose API on the same port simultaneously.

## Commands

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm db:migrate
pnpm content:validate
```

## Architecture

- `apps/web`: static-first Astro application
- `apps/api`: Node Hono service with PostgreSQL
- `packages/contracts`: Zod response schemas shared across packages
- `packages/curriculum`: versioned Zod curriculum schemas and validator
- `content/en`: reviewed MDX lessons and YAML metadata
- `apps/web/src/pages/tracks` and `/lessons`: statically generated learning navigation
- `database/migrations`: forward-only SQL migrations
- `docs/adr`: architecture decisions

## Security and production readiness

- Health and public catalog routes are the only API features included. **No authentication, grading, sandbox, or certificate issuance is implemented.**
- Never expose database credentials in `PUBLIC_` web variables.
- Local Compose credentials are development-only; replace for deployed environments.
- Set `WEB_ORIGIN` to an exact trusted origin, configure TLS and network isolation, and provision secrets in a secret manager.
- Use managed PostgreSQL backups and test restoration before launch.
- Run database migrations as a separate release job, not automatically on every server boot.
- The generated starter does not contain a lockfile because package registry access was unavailable during generation. Run `pnpm install` once and commit `pnpm-lock.yaml`, then change CI and Docker installs to `--frozen-lockfile`. CI currently uses `--no-frozen-lockfile` until that step is completed.
- CI performs checks; deployment is deliberately not configured until infrastructure and secrets are chosen.
- Pin GitHub Actions to audited commit SHAs before enabling sensitive deployment workflows.
- Run `pnpm audit` and review dependency updates regularly.

## Database migrations

Migrations use `node-pg-migrate` using a transactional SQL migration runner with a PostgreSQL advisory lock. `pnpm db:migrate` loads `apps/api/.env`. The baseline SQL migration creates application entities but does not grant public database access. Authenticated endpoints and RLS policy design are Sprint 4 work.

See [Sprint 2 documentation](docs/sprint2.md) for routes, tests, and limitations.

## License

Source code: Apache-2.0 (see `LICENSE`). Educational content: CC BY-SA 4.0 (see `content/LICENSE.md`).

## Sprint 3 interactive exercises

Three HTML/CSS exercises are available at `/exercises/html-heading-001`, `/exercises/html-landmarks-001`, and `/exercises/css-flex-001`. The editor uses accessible textareas, an opaque-origin sandboxed iframe, a declarative test suite and client-side formative feedback. **Not suitable for trusted exams or certificates.** See [Sprint 3 security notes](docs/sprint3.md).


## Sprint 4 — Learner accounts and progress

Sprint 4 adds Supabase email-link authentication, JWT-verified API routes, enrollment, persistent lesson completion, formative submission records, a learner dashboard, and authorization tests.

See [Sprint 4 setup and security notes](docs/sprint4.md). Run `pnpm db:seed:curriculum` after migrating the database to populate the lesson metadata used for progress tracking.

**Not production-certified:** Staging auth flows, CSP, distributed rate limiting, database integration tests, and operational review are still required. Client-side formative scores are not secure certification evidence.


## Sprint 5 — completion credentials

Adds track eligibility, Ed25519-signed self-paced completion certificates, transactional idempotent issuance, revocation audit storage, public verification (`/verify/?id=...`), and a dashboard certificate section. See `docs/sprint5-credentials.md` for configuration and production limitations.

To generate a development key: `node infrastructure/scripts/generate-dev-signing-key.mjs`. Store it only in a local untracked environment file or secret manager.

## Sprint 6: release hardening

Playwright browser and accessibility tests: `pnpm exec playwright install chromium && pnpm test:e2e`. Unit tests: `pnpm test`. Release checklist: `docs/release/sprint6-release.md`. Operational scripts: `infrastructure/scripts/`. These checks are not a substitute for a penetration test or manual accessibility review.

Rate limiting defaults to in-process memory for local/single-instance development only; configure shared distributed or edge rate limiting with verified client IP handling before scaling. Structured request logs intentionally omit URLs with query strings, headers and request bodies.


## Sprint 7 staging and verification

See [staging deployment guide](docs/staging-deployment.md) and [actual verification report](docs/release/sprint7-verification.md). The repository has **not** passed a full dependency install, typecheck, build, or browser test in the packaging environment because npm registry DNS resolution failed.
