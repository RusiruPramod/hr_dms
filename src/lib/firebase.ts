// Firebase initialization. Reads config from VITE_FIREBASE_* env vars.
// When config is absent the app falls back to localStorage automatically.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId);

if (firebaseEnabled && typeof window !== "undefined") {
  app = initializeApp(cfg as Record<string, string>);
  db = getFirestore(app);
}

export { app, db };
