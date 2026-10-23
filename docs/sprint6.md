# Sprint 6 production hardening

Adds Playwright E2E tests, axe-core accessibility scans, browser sandbox invariants, Hono API request logging, memory-backed development rate limiting, backup/restore scripts, readiness checks, security CI and release runbooks.

Run: `pnpm install && pnpm test && pnpm test:e2e` after installing Playwright Chromium with `pnpm exec playwright install --with-deps chromium`.

**Important:** This is a release candidate baseline, not production security certification. See `docs/release/sprint6-release.md` for blocking gaps.
