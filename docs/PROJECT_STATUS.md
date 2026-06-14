# Project Status & Next Steps

## Current state (from workspace)
- Frontend form: `src/components/intern-form.tsx` — implemented with validation and suggestions.
- Document templates: `src/components/offer-letter-document.tsx`, `src/components/nda-document.tsx` — render previews.
- Helpers: `src/lib/format.ts` (date, duration, name helpers) and `src/lib/company.ts` added.
- Missing: server endpoints for persistent storage/generation, auth middleware, storage integration, signature UI & storage, doc generation pipeline.

## High-priority next tasks
1. Implement server CRUD endpoints for interns and documents
2. Add Firebase Auth client plus Admin verification middleware on server
3. Implement storage adapter (S3 or Firebase Storage) and upload hooks
4. Implement document generation worker (Puppeteer/Playwright) and queue
5. Add signature capture and store signatures as images

## Suggested milestones
- Week 1: Auth + CRUD APIs + DB schema
- Week 2: Storage integration + signature upload + single-document generation
- Week 3: Batch generation, email, logging, and deployment automation

## Risks
- Legal templates require careful review; maintain a single source of truth for signatories
- PII handling requires strict access control and retention policies
