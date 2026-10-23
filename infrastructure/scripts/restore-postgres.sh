#!/usr/bin/env bash
set -euo pipefail
: "${RESTORE_DATABASE_URL:?Set RESTORE_DATABASE_URL to an EMPTY destination database}"
: "${BACKUP_FILE:?Set BACKUP_FILE}"
if [[ "${CONFIRM_RESTORE:-}" != "RESTORE_TO_EMPTY_DATABASE" ]]; then
 echo 'Refusing restore: set CONFIRM_RESTORE=RESTORE_TO_EMPTY_DATABASE' >&2; exit 2
fi
if [[ -f "$BACKUP_FILE.sha256" ]]; then (cd "$(dirname "$BACKUP_FILE")" && sha256sum -c "$(basename "$BACKUP_FILE").sha256"); fi
pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --no-acl --exit-on-error "$BACKUP_FILE"
echo 'Restore completed; run application smoke tests and integrity checks.'
