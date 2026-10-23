# ADR-0002: Git-based versioned curriculum

Status: Accepted for Sprint 2.

Lessons are MDX and metadata YAML under `content/en/`. Build-time Zod validation checks schema and graph references. The content repository is trusted only after maintainer review; arbitrary community MDX must never be deployed directly without code review. Interactive practice and user progress are future sprints.
