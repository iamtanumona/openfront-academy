#!/usr/bin/env bash
set -euo pipefail
: "${API_URL:=http://localhost:3001}"
: "${WEB_URL:=http://localhost:4321}"
curl --fail --silent --show-error "$API_URL/v1/health/live" >/dev/null
curl --fail --silent --show-error "$API_URL/v1/health/ready" >/dev/null
curl --fail --silent --show-error "$WEB_URL/" >/dev/null
printf 'Readiness HTTP checks passed. Run tests and manual security checklist separately.\n'
