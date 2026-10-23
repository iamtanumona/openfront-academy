# Sprint 6 release readiness

## Blocking gates

- [ ] Dependency installation and frozen lockfile generated/committed
- [ ] Lint, typecheck, unit tests, curriculum validation, production build pass
- [ ] Playwright desktop/mobile E2E and axe automated scans pass
- [ ] Manual keyboard and screen-reader audits completed
- [ ] Sandbox tested in Chromium, Firefox, WebKit with malicious fixtures
- [ ] Trusted proxy / rate-limit key policy verified; distributed store enabled for scaled deployment
- [ ] Authentication authorization and credential issuance integration tests pass
- [ ] Credential signing keys protected and key-rotation procedure reviewed
- [ ] Backup, offsite retention and isolated restore drill documented
- [ ] Metrics, log retention, alerts, on-call owner and privacy review complete
- [ ] Database migrations tested in staging, rollback strategy documented
- [ ] API readiness and web availability checks pass
- [ ] No unresolved critical or high severity security findings

## Known gaps / no production sign-off yet

- Browser-only sandbox grading is not trusted; do not issue skills certificates from its scores.
- Per-process memory limiter is not suitable for distributed production; replace with a shared store or edge limiter and a trustworthy client identity policy.
- Browser sandbox security tests are smoke tests, not a full penetration test.
- Manual WCAG 2.2 AA review is required; axe checks alone are insufficient.
- Automated tests require package installation and a browser environment; repository generation does not prove passing results.
- Existing credential implementation needs production KMS and historical signing-key support.
- Backups require an external scheduler, encrypted storage, retention policy and restore drills.

## Deployment sequence

1. Deploy staging; migrate database and run smoke tests.
2. Execute security and accessibility sign-offs.
3. Take verified backup; approve production migration.
4. Deploy API then web, validate health endpoints and certificate verification.
5. Monitor latency, error rates, auth failures, sandbox errors and certificate issuance.
6. Roll back application code on regressions; database rollback requires a separate reviewed plan.
