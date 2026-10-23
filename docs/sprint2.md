# Sprint 2 scope and verification

Implemented: curriculum schemas, Git-hosted YAML/MDX lessons, track and lesson static routes, breadcrumb navigation, skip link, keyboard focus styles, reduced-motion CSS, curriculum validation and tests. Eight initial lessons (four HTML and four CSS) are included as a pilot; the remaining lessons are later authoring work.

## Commands

```sh
pnpm install
pnpm content:validate
pnpm --filter @ofa/curriculum test
pnpm --filter @ofa/web build
pnpm dev
```

Visit `/tracks`, `/tracks/frontend-foundations`, and `/lessons/html-document-structure`.

## Known limitations

- MDX content is **maintainer-reviewed code**, not sanitized untrusted user input. Never merge arbitrary JSX/imports from contributors without review.
- Exercise definitions have a schema but no browser runner in Sprint 2.
- No login, persisted progress, exams, or credentials yet.
- Locale infrastructure is directory-based; translated routes and RTL support remain future work.
- Manual accessibility testing with screen readers and keyboard is required before a public production release.
- This package does not include a lockfile; install dependencies, commit the lockfile, then enable frozen installs.
