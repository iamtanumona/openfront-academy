# Incident response

1. Triage alerts for availability, authentication failures, credential issuance, and sandbox isolation.
2. Record incident start time, affected services, severity, and incident commander.
3. Contain: disable certificate issuance or affected endpoints, revoke compromised credentials, and isolate sandbox hosting when needed.
4. Preserve sanitized logs and evidence; never publish tokens, learner code, or personal data.
5. Communicate impact and remediation through the status channel.
6. Restore from known-good releases or verified backups, then run smoke tests.
7. Publish a postmortem with preventive actions and owners.

Security reports: follow SECURITY.md. Maintain a contact rotation and incident notification process before public launch.
