# Project Status & Next Steps

## Current state (from workspace)
 - Frontend form: `src/components/intern-form.tsx` — implemented with validation, suggestions, and normalized supervisor placeholder.
 - Document templates: `src/components/offer-letter-document.tsx`, `src/components/nda-document.tsx` — render previews and now import centralized company data.
 - Helpers: `src/lib/format.ts` updated (added `formatNic`, `firstName`, duration helpers).
 - Centralized config: `src/lib/company.ts` added (company name, address, authorized signatory, witness).
 - Firebase client: `src/firebase/firebase.js` created; `firebase` installed and `.env` / `.env.example` added.
 - Documentation: full spec and supporting docs added under `docs/` (`SRS.md`, `ARCHITECTURE.md`, `DB_CRUD_SPEC.md`, `FULL_PROJECT_REPORT.md`, `FIREBASE_GUIDE.md`, etc.).
 - Missing / not implemented yet: server-side Firebase Admin init and auth middleware, persistent DB migrations and CRUD endpoints, server storage adapter (Firebase Admin or S3) and upload hooks, signature capture UI (canvas) integration, document generation worker (Playwright/Puppeteer or docx templating), CI and tests.

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
