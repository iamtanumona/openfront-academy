# Staging deployment guide (Sprint 7)

## Architecture

- **Web**: Astro static build on Cloudflare Pages, e.g. `staging.openfront.example`.
- **API**: Hono Node.js container on a private VM, exposed only via a configured HTTPS reverse proxy or Cloudflare Tunnel at `api-staging.openfront.example`.
- **Auth**: separate Supabase staging project. Set its Site URL and allow-listed redirect URLs to the staging frontend.
- **Data**: PostgreSQL with TLS, restricted network access, dedicated least-privilege role and tested backups.
- **Certificates**: use a staging-only Ed25519 signing key; do not reuse production private keys.

## Web configuration

Copy `infrastructure/staging/.env.web.staging.example` to a secret store or CI environment variables. The static build embeds variables beginning with `PUBLIC_`; **never put secrets in them**. GitHub Actions environment `staging` must provide:

- Variables: `STAGING_API_BASE_URL`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_PUBLISHABLE_KEY`, `STAGING_SITE_URL`, `CLOUDFLARE_PAGES_PROJECT`.
- Secrets: `CLOUDFLARE_API_TOKEN` (scoped Pages edit permission), `CLOUDFLARE_ACCOUNT_ID`.

Run the manual **Staging web (Cloudflare Pages)** workflow after creating the Pages project. Set `staging` branch deployment custom domain through Cloudflare and verify its URL; Pages preview branch routing can differ from the configured custom domain.

## API configuration

Copy `infrastructure/staging/.env.staging.example` to `infrastructure/staging/.env.staging`, fill real values locally or inject them from a secret manager. Never commit this file. From repository root:

```bash
docker compose -f infrastructure/staging/compose.staging.yaml up -d --build
curl --fail http://127.0.0.1:3001/v1/health/ready
```

Run migrations and curriculum seed **as controlled one-off release jobs** before routing traffic. Do not expose the port 3001 directly to the internet. For a remote API, configure the reverse proxy or Cloudflare Tunnel to target loopback 3001, enable TLS, and restrict origin access. A Cloudflare-proxied DNS record alone does not protect an origin against direct access.

## Security and operations

- Supabase JWT issuer must match the staging project; audience `authenticated` by default.
- CORS `WEB_ORIGIN` must exactly match the deployed frontend origin.
- Rate limiting currently uses in-memory counters and must be replaced with shared durable storage before multi-instance production.
- Configure request logging, health alerts, Postgres backup encryption and a restore drill.
- Rotate staging credentials after incidents and revoke compromised signing keys according to credential policy.
- Deployments require successful integration and accessibility tests, smoke checks, and a documented rollback path.
