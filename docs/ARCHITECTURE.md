# High-Level Architecture

## Overview

Three-layer architecture:

- Frontend: Vite + React (client UI, routing, form validation, previews)
- Backend: Node.js server / serverless functions (APIs, auth verification, doc generation)
- Storage: Cloud storage (Firebase Storage or S3) + relational DB (Postgres) for metadata

## Components

- UI Components: `InternForm`, `OfferLetterDocument`, `NdaDocument` under `src/components`
- API: `/api/interns`, `/api/documents`, auth endpoints
- Document Generation Service: render templates server-side to PDF/DOCX
- Auth Service: Firebase Auth + Admin SDK for token verification and custom claims

## Data Flow

1. User fills `InternForm` → POST `/api/interns`
2. Server validates, saves record in DB
3. User clicks Generate → POST `/api/interns/:id/generate`
4. Server renders templates (embedding signatures), stores files in Storage, saves `documents` metadata
5. Client fetches download links (signed URLs)
