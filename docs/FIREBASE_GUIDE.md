# Firebase Integration Guide

## Overview

Use Firebase Auth for identity and Firebase Storage for storing generated documents and signatures. Optionally use Firestore for real-time features.

## Client setup

1. Install: `npm install firebase`
2. Add environment variables (this project uses these names — see `.env.example`):

- `VITE_API_KEY`
- `VITE_AUTH_DOMAIN`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`
- `VITE_MESSAGING_SENDER_ID`
- `VITE_APP_ID`

3. The project initializes Firebase in `src/firebase/firebase.ts` and exports `auth` and `storage` for use in UI routes.

## Server setup

1. Install admin SDK: `npm install firebase-admin`
2. Provide service account JSON via `FIREBASE_SERVICE_ACCOUNT` — this project expects a base64-encoded JSON string in the env variable (see `.env.example`). Example to set locally (PowerShell):

```
$svc = Get-Content serviceAccountKey.json | Out-String | ConvertTo-Base64String
# then set FIREBASE_SERVICE_ACCOUNT to $svc
```

Or on Linux/macOS:

```
export FIREBASE_SERVICE_ACCOUNT=$(base64 serviceAccountKey.json | tr -d '\n')
```

3. The project provides `src/lib/firebase-admin.ts` which reads `FIREBASE_SERVICE_ACCOUNT` (base64), initializes `firebase-admin`, and uses `FIREBASE_STORAGE_BUCKET` for storage operations.
4. Use `admin.auth().verifyIdToken(idToken)` to authenticate requests and `admin.storage().bucket()` to upload generated files server-side.

## Security rules

- Storage: restrict writes to authenticated users and admin-only writes for produced documents
- Firestore (if used): secure by role and validate required fields

## Signing flow

1. Client captures signature (canvas), uploads to Storage (with user token) or sends to server to store via Admin.
2. Generated documents embed signature URLs when rendering templates.

Note: Storage buckets and rules should be configured to allow authenticated client uploads for temporary signature files; final generated documents should be written by server/admin to a protected bucket path.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyD3u6gtXQw9fbDo-KeqefrzchcNVelt4sE",
authDomain: "hr-document-management-abfaa.firebaseapp.com",
projectId: "hr-document-management-abfaa",
storageBucket: "hr-document-management-abfaa.firebasestorage.app",
messagingSenderId: "308947813959",
appId: "1:308947813959:web:70692a6defc9ba0ad0d362"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
