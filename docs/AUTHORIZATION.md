# Authentication & Authorization

## Roles

- `admin` — full access (HR admin)
- `recruiter` — create/edit records, generate documents
- `viewer` — read-only (audit)

## Recommended Setup

- Use Firebase Authentication for user identity (email/SSO).
- Assign roles via Firebase Custom Claims or store role mapping in DB.

## Server-side Enforcement

- Use Firebase Admin SDK to verify ID tokens on incoming API calls.
- Implement middleware that checks token validity and required role for each endpoint.

## Token flow

1. Client signs in with Firebase; receives ID token
2. Client includes ID token in `Authorization: Bearer <token>` header
3. Server verifies token, reads `uid` and custom claims, maps to roles

## Files to add

- `src/lib/firebase.ts` (client init)
- `src/lib/firebase-admin.ts` (server init for Admin SDK)
- `src/server/middleware/auth.ts` (token verification middleware)
