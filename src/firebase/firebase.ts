import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const config = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

let app;
try {
  app = initializeApp(config as any);
} catch (err) {
  // initializeApp will throw if already initialized in HMR; ignore
  // eslint-disable-next-line no-console
  console.warn("Firebase init warning:", err);
}

export const auth = getAuth(app as any);
export const storage = getStorage(app as any);

export const firebaseEnabled = !!import.meta.env.VITE_API_KEY;

export default app;
