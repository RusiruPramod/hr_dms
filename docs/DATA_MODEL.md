# Data Model

## Tables (PostgreSQL recommended)

### interns

- id (uuid, pk)
- full_name (text)
- name_with_initials (text)
- nic (text)
- address (text)
- department (text)
- start_date (date)
- end_date (date)
- supervisor_name (text)
- supervisor_title (text)
- phone (text)
- signatures (json) — `{ intern: url, witness: url, hr: url }`
- created_by (uuid)
- created_at, updated_at (timestamps)

### documents

- id (uuid)
- intern_id (fk)
- type (offer|nda|other)
- storage_url
- format (pdf|docx)
- generated_at
- generated_by

### users (if self-hosted)

- id (uuid)
- uid (firebase uid)
- email
- name
- role

### audit_logs

- id, user_id, action, target_type, target_id, metadata (json), timestamp
