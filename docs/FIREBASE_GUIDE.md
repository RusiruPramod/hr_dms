# Firebase Integration Guide

## Overview
Use Firebase Auth for identity and Firebase Storage for storing generated documents and signatures. Optionally use Firestore for real-time features.

## Client setup
1. Install: `npm install firebase`
2. Add environment variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`.
3. Create `src/lib/firebase.ts` to initialize app, export `auth` and `storage`.

## Server setup
1. Install admin SDK: `npm install firebase-admin`
2. Provide service account JSON via `FIREBASE_SERVICE_ACCOUNT` (path or base64)
3. Initialize admin in server code and use `admin.auth().verifyIdToken(idToken)` to authenticate requests
4. Use `admin.storage().bucket()` to upload generated files from server

## Security rules
- Storage: restrict writes to authenticated users and admin-only writes for produced documents
- Firestore (if used): secure by role and validate required fields

## Signing flow
1. Client captures signature (canvas), uploads to Storage (with user token) or sends to server to store via Admin
2. Generated documents embed signature URLs when rendering templates
