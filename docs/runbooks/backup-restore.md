# Backup and restore runbook

## Backup

Use PostgreSQL client utilities matching the server major version. Configure `DATABASE_URL` and an encrypted, access-controlled `BACKUP_DIR`, then run `bash infrastructure/scripts/backup-postgres.sh`. Upload the resulting dump to encrypted offsite storage. Do not commit it.

## Restore drill

Create a **new empty** isolated PostgreSQL database. Set `RESTORE_DATABASE_URL`, `BACKUP_FILE`, and `CONFIRM_RESTORE=RESTORE_TO_EMPTY_DATABASE`; run `bash infrastructure/scripts/restore-postgres.sh`. Check row counts, migration state, credential verification and API health. Never run against production as a routine test.

## Policy

Initial RPO target: 24 hours. Initial RTO target: 8 hours. Schedule daily backups, retention, periodic restore drills, and encryption/key rotation using the hosting provider. The scripts alone do not provide scheduling, encryption, or offsite retention.
