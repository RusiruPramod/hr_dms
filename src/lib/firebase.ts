// Firebase initialization. Reads config from VITE_FIREBASE_* or VITE_* env vars.
// When config is absent the app falls back to localStorage automatically.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.VITE_APP_ID,
};

let app;
try {
  app = initializeApp(cfg);
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn("Firebase client init warning:", err);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId);

export { app };
export default app;
