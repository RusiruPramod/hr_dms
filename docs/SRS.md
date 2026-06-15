# Software Requirements Specification (SRS)

Project: HR Document Management (Interns)

## 1. Purpose

Provide a web system to collect intern data, validate it, map it to legal templates (Offer Letter, NDA), collect signatures, generate final documents (PDF/DOCX), and store/manage records securely.

## 2. Actors

- HR Admin (role: admin)
- Recruiter (role: recruiter)
- Intern / Candidate (role: candidate)
- Supervisor / Witness (external participants)
- System (server tasks)

## 3. Functional Requirements

- FR1: CRUD for intern records with validation (NIC, phone, dates)
- FR2: Auto-calc internship duration
- FR3: Map record fields to Offer Letter and NDA templates and render previews
- FR4: Generate and store PDFs/DOCX for documents and attach to intern record
- FR5: Capture and attach signatures (intern, witness, HR)
- FR6: Role-based access control for editing/generation
- FR7: Audit logs for changes and document generation
- FR8: Batch generation/export and email sending (optional)

## 4. Non-Functional Requirements

- NFR1: HTTPS and encrypted storage for PII
- NFR2: Typical document generation <= 5s per doc
- NFR3: Scalable to batch-generate hundreds of docs
- NFR4: Data retention and compliance policies

## 5. Constraints

- Use existing frontend stack (Vite + React + TanStack Router)
- Document templates must be legal-compliant and editable by developers

## 6. Acceptance Criteria

- Intern form validates required fields and persists records
- OL and NDA render with correct data and downloadable files
- Auth enforces roles and prevents unauthorized actions
