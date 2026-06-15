# Full Project Report — HR Document Management System

This consolidated report gathers the SRS, architecture, auth, frontend, backend, database, Firebase integration, recommendations, and project status for the HR Document Management project.

## Executive Summary

- Purpose: Collect intern data, validate, generate legal documents (Offer Letter, NDA), collect signatures, store and audit records.
- Current progress: Frontend forms and templates implemented; format helpers and company config added. Server endpoints, auth enforcement, storage, and generation worker remain.

## Key Links

- SRS: [docs/SRS.md](docs/SRS.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Auth & Roles: [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md)
- Frontend Spec: [docs/FRONTEND_SPEC.md](docs/FRONTEND_SPEC.md)
- Backend Spec: [docs/BACKEND_SPEC.md](docs/BACKEND_SPEC.md)
- Data Model: [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- Firebase Guide: [docs/FIREBASE_GUIDE.md](docs/FIREBASE_GUIDE.md)

# Full Project Report — HR Document Management System (Complete Specification)

This comprehensive specification consolidates the system requirements, architecture, data model, API contracts, implementation guidance, deployment steps, and test plan for the HR Document Management project.

Generated: 2026-06-14

---

## 1. Overview and Purpose

The system's goal is to collect candidate/intern data, validate the data, produce legal documents (Offer Letter and NDA), collect signatures, securely store final documents and associated metadata, and provide role-based access for HR staff and recruiters. The system must ensure data integrity, auditability, and legal compliance.

Primary users: HR Admin, Recruiter, Intern (candidate), Supervisor, Witness.

---

## 2. Detailed Functional Requirements

- FR1: User Authentication & Roles
  - Sign-in using email/password or SSO. Roles: `admin`, `recruiter`, `viewer`.
  - Role mapping stored in DB or via Firebase custom claims.

- FR2: Intern Records
  - Create, read, update, delete intern records. Validate `nic`, `phone`, `startDate < endDate`.
  - Suggest existing records by name while typing (autocomplete).

- FR3: Document Templates
  - Maintain templates for Offer Letter and NDA as React components. Templates accept intern data and render preview.

- FR4: Document Generation
  - Generate final documents as PDF (preferred) and optionally DOCX for NDA.
  - Embed signatures and official signatory info from centralized config.

- FR5: Signatures
  - Capture signature via canvas or file upload. Store signature images and reference in generated documents.

- FR6: Storage & Metadata
  - Store generated files in cloud storage and document metadata in DB.

- FR7: Audit Logging
  - Log create/update/delete/generation actions with user ID and timestamp.

- FR8: Batch Operations
  - Support batch generation for selected interns and batch downloads.

- FR9: Notifications (optional)
  - Send notifications (email with secure link) upon document generation.

---

## 3. Non-Functional Requirements

- Security: HTTPS, server-side token verification, storage access control.
- Performance: Single document generation <= 5s under normal load.
- Scalability: Support generating hundreds of documents in batches via queue workers.
- Auditability: Maintain immutable audit logs for legal compliance.
- Backup & Retention: Daily DB backups; storage lifecycle to meet retention policy.

---

## 4. System Architecture

High-level components:

- Frontend: Vite + React + TanStack Router; UI components under `src/components`.
- Backend: Node.js server or serverless functions for API endpoints and generation worker.
- Queue: Background job queue (BullMQ, Bee-Queue, or Cloud Tasks) for document generation.
- DB: PostgreSQL for structured data and metadata.
- Storage: Firebase Storage or Amazon S3 for files and signatures.
- Auth: Firebase Auth (client) + Firebase Admin (server) recommended.

Data flow:

1.  User creates/updates intern record in UI.
2.  Client sends request to backend; backend validates and saves to DB.
3.  For generation, backend enqueues job; worker renders templates and uploads files.
4.  Worker updates DB documents table and audit logs; client pulls document links.

---

## 5. Frontend Specification (Detailed)

Pages & Components:

- Dashboard: counts, quick actions, recent activity.
- Records List: search (by name, NIC), pagination, filters by department.
- Record Detail: preview generated documents, upload signatures, actions.
- Record Form: `InternForm` (existing) with fields and validation.
- Documents Preview: `OfferLetterDocument`, `NdaDocument` components render previews.

Canonical fields and validation rules:

- `fullName` (required) — string
- `nameWithInitials` (optional) — string
- `nic` (required) — pattern: 12 digits or 9 digits + V/X; store normalized
- `address` (required) — multi-line text
- `department` (required)
- `startDate` (required) — ISO date
- `endDate` (required) — ISO date, must be after `startDate`
- `supervisorName` and `supervisorTitle` (required)
- `phone` (optional) — 10–15 digits
- `internSignature`, `witnessSignature`, `hrSignature` — URL to image

UX details:

- Real-time suggestions while typing `fullName` using existing records.
- Show placeholders for missing fields in preview.
- Inline validation on blur and before submit.
- Signature capture: allow drawing on canvas or uploading an image.

---

## 6. Backend Specification (Detailed)

API endpoints (REST)

Base: `/api`

1. Create intern

- POST `/api/interns`
- Auth: `recruiter` or `admin`
- Body JSON: see earlier example (fullName, nic, address, ...)
- Response: 201 with created id

2. Read intern

- GET `/api/interns/:id` → returns intern + documents + signatures

3. Update intern

- PUT `/api/interns/:id` → update fields

4. Delete intern

- DELETE `/api/interns/:id` → admin only

5. Generate documents

- POST `/api/interns/:id/generate?docs=offer,nda`
- Body: { includeSignature: boolean }
- Response: job id or documents array

6. Upload signature

- POST `/api/interns/:id/signature` (multipart) { type, file }

7. Download document

- GET `/api/documents/:id/download` (returns signed URL or streams file)

Server-side responsibilities

- Validate all inputs and re-run validation for business rules.
- Verify auth token and role on each request.
- Use transactions for multi-step operations; use status fields for async generation.

Document generation worker

- Renders React components server-side (Next.js, or render to static HTML using a headless renderer) then converts to PDF using Playwright/Puppeteer or uses docx templating for Word outputs.
- Uploads file to storage and updates `documents` table.

Queue & retries

- Use Redis-backed queue with retry policies and error handling.

---

## 7. Data Model (DDL & Examples)

Core tables: `users`, `interns`, `documents`, `signatures`, `audit_logs`.

DDL (PostgreSQL snippets):

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	uid text UNIQUE NOT NULL,
	email text,
	name text,
	role text NOT NULL DEFAULT 'recruiter',
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE interns (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	full_name text NOT NULL,
	name_with_initials text,
	nic text NOT NULL,
	address text NOT NULL,
	department text,
	start_date date,
	end_date date,
	supervisor_name text,
	supervisor_title text,
	phone text,
	metadata jsonb DEFAULT '{}'::jsonb,
	created_by uuid REFERENCES users(id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX interns_nic_idx ON interns (nic);

CREATE TABLE documents (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	intern_id uuid REFERENCES interns(id) ON DELETE CASCADE,
	type text NOT NULL,
	storage_url text NOT NULL,
	format text NOT NULL,
	generated_by uuid REFERENCES users(id) ON DELETE SET NULL,
	generated_at timestamptz NOT NULL DEFAULT now(),
	metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE signatures (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	intern_id uuid REFERENCES interns(id) ON DELETE CASCADE,
	type text NOT NULL,
	url text NOT NULL,
	uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
	uploaded_at timestamptz NOT NULL DEFAULT now(),
	metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE audit_logs (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id uuid REFERENCES users(id) ON DELETE SET NULL,
	action text NOT NULL,
	target_type text,
	target_id uuid,
	metadata jsonb DEFAULT '{}'::jsonb,
	created_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes and search

- `interns_nic_idx` for NIC lookups.
- Full-text index on `full_name` for fuzzy search:

```sql
CREATE INDEX interns_fullname_fts ON interns USING gin(to_tsvector('english', full_name));
```

---

## 8. Authentication & Authorization Implementation

Client (browser)

- Use Firebase SDK to sign in and obtain ID token.
- Send `Authorization: Bearer <idToken>` with API requests.

Server (Node)

- Install `firebase-admin` and initialize with service account.
- Middleware pseudocode:

```ts
import admin from "firebase-admin";

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization?.split(" ")[1];
  if (!auth) return res.status(401).send("Unauthorized");
  try {
    const decoded = await admin.auth().verifyIdToken(auth);
    req.user = { uid: decoded.uid, claims: decoded }; // map to local user id/role
    // Optionally fetch role from users table or use decoded.custom_claims.role
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}
```

Role checks

- Use middleware `requireRole('admin')` for restricted endpoints.

---

## 9. Firebase Storage & Signature Flow

Client-side signature capture:

- Use a `canvas` component to draw signature and convert to PNG (`canvas.toDataURL('image/png')`).
- POST to `/api/interns/:id/signature` as multipart/form-data or upload directly to `Firebase Storage` with client token (rule-protected).

Server-side upload (Admin SDK):

```ts
const bucket = admin.storage().bucket();
const file = bucket.file(`signatures/${internId}/intern-${uuid()}.png`);
await file.save(Buffer.from(base64, "base64"), { contentType: "image/png" });
const publicUrl = await file.getSignedUrl({ action: "read", expires: Date.now() + 3600 * 1000 });
```

Store URL in `signatures` table and embed in document generation.

---

## 10. Document Generation (Technical Details)

Options:

- Render React templates server-side and use Playwright/Puppeteer to print to PDF (recommended).
- For DOCX, use a templating library (Docxtemplater) and replace placeholders, including embedding images.

Worker responsibilities:

1. Fetch intern record and signatures from DB.
2. Render template to HTML (server-side render or a headless renderer).
3. Convert HTML to PDF and/or fill DOCX template.
4. Upload file to storage and create `documents` record.
5. Update audit log and notify user (optional).

Security: perform generation in a sandboxed environment and validate all inputs.

---

## 11. CI / Tests / Deployment

Testing:

- Unit tests for `format` helpers, validation logic.
- Integration tests for API endpoints (using test DB).
- End-to-end test for generation flow (spawn worker and check stored file).

CI pipeline (example GitHub Actions):

1. Run unit tests
2. Build frontend (`npm run build`)
3. Run server lint & tests
4. Build Docker image and push to registry

Deployment:

- Use Vercel/Netlify for frontend; server as container in Cloud Run or AWS ECS; worker as cloud function or separate container with queue.

Environment variables (example):

```
DATABASE_URL=postgres://user:pass@host:5432/hr_dms
FIREBASE_SERVICE_ACCOUNT={base64-json}
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
STORAGE_BUCKET=...
JWT_SECRET=...
```

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyD3u6gtXQw9fbDo-KeqefrzchcNVelt4sE",
authDomain: "hr-document-management-abfaa.firebaseapp.com",
projectId: "hr-document-management-abfaa",
storageBucket: "hr-document-management-abfaa.firebasestorage.app",
messagingSenderId: "308947813959",
appId: "1:308947813959:web:70692a6defc9ba0ad0d362"
};

---

## 12. Migration & ORM

- Recommended: use Prisma for type-safe DB access and migrations.
- Example Prisma model for `Intern` and `Document` in `schema.prisma` and run `prisma migrate dev`.

---

## 13. Monitoring & Observability

- Log generation job durations and errors to centralized logging (Cloud Logging, Sentry).
- Instrument metrics: number of generated documents, average generation time, queue length.

---

## 14. Acceptance Criteria & Handover

Minimum deliverable:

- End-to-end flow: create intern → upload signature → generate OL and NDA → download stored files.
- RBAC enforced: only authorized roles can create/generate.
- Audit logs recorded for major actions.

Handover items:

- Database migration files
- API docs (OpenAPI/Swagger)
- Deployment runbook
- Developer README with local setup steps

---

## 15. Actionable Next Steps (I can implement)

I can proceed with any of the following — pick one:

- A: Implement DB migrations + `/api/interns` CRUD skeleton (server + sample tests).
- B: Add Firebase Auth client initialization + server middleware and user mapping.
- C: Implement signature upload endpoint and storage adapter (Firebase/S3).
- D: Implement document generation worker (single-record generation using Playwright) and integrate with storage.

Tell me which item to start with and I'll implement it and push changes to the workspace.
