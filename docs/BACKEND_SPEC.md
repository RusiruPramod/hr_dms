# Backend Specification

## API Endpoints (REST)

- `GET /api/interns` — list & search
- `POST /api/interns` — create
- `GET /api/interns/:id` — fetch record
- `PUT /api/interns/:id` — update
- `POST /api/interns/:id/generate` — generate documents (query `?docs=offer,nda`)
- `POST /api/interns/:id/signature` — upload signature image
- `GET /api/documents/:id/download` — secure download

## Services

- Document generation: server worker that renders React templates to HTML and converts to PDF/DOCX
- Storage adapter: upload/download to Firebase Storage or S3
- Audit logger: append logs to DB

## Implementation Notes

- Use streaming where possible for large batches
- Run generation tasks in background queue (BullMQ / Cloud Tasks)
