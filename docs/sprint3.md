# Sprint 3: browser coding exercises

## Delivered

- React HTML/CSS/JavaScript editor (accessible textareas; Monaco is intentionally deferred).
- Per-run `srcDoc` iframe with `sandbox="allow-scripts"` (opaque origin), CSP and no credentials.
- Request ID and unpredictable nonce checked alongside `event.source` and `event.origin`.
- Versioned, declarative DOM-count test DSL; three example exercises.
- Weighted formative scoring and clear learner-facing feedback.
- Security-oriented unit tests, curriculum validation and CI integration.

## Threat model and limitations

**Not a secure examination engine.** Learner code and tests run in the same untrusted iframe, so results are forgeable. The platform must never issue trusted skill certificates based on these scores. `srcDoc` uses the parent document as a base URL: CSP blocks outbound fetch, images except data/blob, frames, forms, and external scripts, but real-browser security verification is required. Browser execution timeout is best effort; a synchronous infinite loop may block the UI thread. Do not include API tokens or hidden tests in the preview. The sandbox's opaque origin is enforced by omitting `allow-same-origin`. Do not add that flag.

## Production hardening before public release

1. Host the editor/sandbox bridge on a separately registered sandbox site, not merely a subdomain.
2. Enforce CSP with an HTTP response header on the sandbox host, not only an injected meta tag; validate policies across Chromium, Firefox and WebKit.
3. Move untrusted JavaScript execution to a dedicated worker/isolated origin where practical; enforce termination and resource budgets.
4. Add Playwright security checks for navigation, cross-origin access, credential isolation, popup prevention, and network requests.
5. Consider disallowing learner-supplied `<script>` elements in HTML and document.write for the MVP, or parse and normalize HTML in a hardened runner.
6. Never rely on client-reported formative scores for credentials.

## Local checks

`pnpm install && pnpm content:validate && pnpm test && pnpm typecheck && pnpm build`

Visit `/lessons/html-document-structure` and follow the practice link or open `/exercises/html-heading-001`.
