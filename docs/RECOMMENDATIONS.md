# Recommendations & Tradeoffs

## Database choice

- Use PostgreSQL for core structured data (interns, documents, audit). Strong consistency and reporting.
- Use Firestore only for realtime UI updates or notifications.

## Storage

- Use Firebase Storage or S3 for documents and signatures. Both support signed URLs and lifecycle rules.

## Document generation

- Option A (recommended): Server-side render React templates to HTML then convert to PDF with Puppeteer/Playwright. Use docx templating for Word outputs when necessary.
- Option B: Client-side HTML to PDF for small-scale setups (less secure).

## Real-time vs batch

- Real-time (Firestore) helps collaborative edits and live status updates. If not required, prefer batch/SQL for simplicity.

## Email & Notifications

- Use Cloud Functions or worker queue to send emails with signed download links after generation.
