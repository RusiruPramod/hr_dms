#!/usr/bin/env node
/*
  Simple verification script to check Firebase-related environment variables
  and try to initialize firebase-admin when a base64 service account is provided.
  Usage: `node scripts/verify-firebase.js` or `npm run verify:firebase`
*/
import admin from "firebase-admin";

function log(key, value) {
  console.log(key.padEnd(30), value ? "SET" : "MISSING");
}

console.log("Checking Firebase environment variables...");
log("VITE_API_KEY", process.env.VITE_API_KEY);
log("VITE_AUTH_DOMAIN", process.env.VITE_AUTH_DOMAIN);
log("VITE_PROJECT_ID", process.env.VITE_PROJECT_ID);
log("VITE_STORAGE_BUCKET", process.env.VITE_STORAGE_BUCKET);
log("VITE_MESSAGING_SENDER_ID", process.env.VITE_MESSAGING_SENDER_ID);
log("VITE_APP_ID", process.env.VITE_APP_ID);
log("FIREBASE_SERVICE_ACCOUNT", process.env.FIREBASE_SERVICE_ACCOUNT);
log("FIREBASE_STORAGE_BUCKET", process.env.FIREBASE_STORAGE_BUCKET);

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log("\nAttempting to initialize firebase-admin...");
  try {
    const svc = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8"),
    );
    admin.initializeApp({
      credential: admin.credential.cert(svc),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_STORAGE_BUCKET,
    });
    console.log("firebase-admin initialized successfully.");
    try {
      const bucket = admin.storage().bucket();
      console.log("Storage bucket:", bucket.name || "(accessible)");
    } catch (e) {
      console.warn("Could not access storage bucket:", e.message);
    }
  } catch (err) {
    console.error("Failed to initialize firebase-admin:", err.message);
    process.exitCode = 2;
  }
} else {
  console.log("\nFIREBASE_SERVICE_ACCOUNT not set — skipping admin init.");
  process.exitCode = 1;
}
