# 🚀 Vercel Deployment Guide — HR DMS

> **Project:** HR Document Management System  
> **Stack:** TanStack Start + Nitro SSR + Firebase + React  
> **Deployment Target:** Vercel (Serverless Functions)

---

## ✅ Availability / Can This Be Deployed on Vercel?

**YES — this project CAN be deployed on Vercel**, but it is **NOT a simple static site**.

| Feature | Status |
|---|---|
| TanStack Start (SSR) | ✅ Supported via Nitro `vercel` preset |
| Firebase Auth / Firestore | ✅ Works (client-side SDK) |
| Firebase Admin SDK | ⚠️ Needs `FIREBASE_SERVICE_ACCOUNT` env var |
| Server-Side Rendering | ✅ Via Vercel Serverless Functions |
| Static Assets | ✅ Auto-served |

> [!IMPORTANT]
> This project uses **Server-Side Rendering (SSR)** via Nitro. It is NOT a plain Vite SPA.
> Vercel must be configured correctly — a wrong setting causes the `404: NOT_FOUND` error.

---

## 📋 Prerequisites

Make sure these files are in the correct state before deploying:

### ✅ `vite.config.ts` — should look like this:
```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
```

### ❌ Do NOT have these files (delete if they exist):
- `vercel.json` — Nitro auto-generates Vercel config. A custom one breaks the build.
- `nitro.config.ts` — Not read by the lovable wrapper. Causes conflicts.

### ✅ `package.json` build script should be:
```json
"build": "vite build"
```
> Do NOT add `&& nitro build` — Nitro runs automatically inside `vite build`.

---

## 🔧 Step-by-Step Deployment

### Step 1 — Clean Up Local Files

Run in your terminal (PowerShell):

```powershell
# If these files exist, delete them
Remove-Item vercel.json -ErrorAction SilentlyContinue
Remove-Item nitro.config.ts -ErrorAction SilentlyContinue
```

### Step 2 — Commit & Push to GitHub

```powershell
git add -A
git commit -m "fix: clean deployment config for vercel"
git push
```

---

### Step 3 — Set Up Vercel Project

Go to **[vercel.com](https://vercel.com)** and open your project (`hr-dms-46nt`).

#### 3a. Build & Development Settings

Navigate to: **Settings → General → Build & Development Settings**

| Setting | Value |
|---|---|
| **Framework Preset** | `Other` |
| **Build Command** | `npm run build` |
| **Output Directory** | *(leave completely BLANK)* |
| **Install Command** | `npm install` |
| **Node.js Version** | `22` |

> [!CAUTION]
> The **Output Directory must be BLANK**. If you set it to `dist`, Vercel cannot find
> the serverless function that Nitro generates in `.vercel/output/`. This causes the 404.

#### 3b. Save Settings

Click **Save** at the bottom of the page.

---

### Step 4 — Add Environment Variables

Navigate to: **Settings → Environment Variables**

Add **ALL** of the following for **Production**, **Preview**, and **Development**:

| Variable Name | Value |
|---|---|
| `VITE_API_KEY` | `AIzaSyD3u6gtXQw9fbDo-KeqefrzchcNVelt4sE` |
| `VITE_AUTH_DOMAIN` | `hr-document-management-abfaa.firebaseapp.com` |
| `VITE_PROJECT_ID` | `hr-document-management-abfaa` |
| `VITE_STORAGE_BUCKET` | `hr-document-management-abfaa.firebasestorage.app` |
| `VITE_MESSAGING_SENDER_ID` | `308947813959` |
| `VITE_APP_ID` | `1:308947813959:web:70692a6defc9ba0ad0d362` |
| `FIREBASE_STORAGE_BUCKET` | `hr-document-management-abfaa.appspot.com` |
| `NITRO_PRESET` | `vercel` |

> [!IMPORTANT]
> `NITRO_PRESET=vercel` is the **most critical variable**.
> Without it, Nitro defaults to Cloudflare Workers output which doesn't work on Vercel.

---

### Step 5 — Redeploy Without Cache

1. Go to **Deployments** tab
2. Click your latest deployment → **"..."** menu → **"Redeploy"**
3. Check **"Redeploy without existing Build Cache"**
4. Click **Redeploy**

---

### Step 6 — Verify

Once status shows **"Ready"** (green), visit your URL:  
`https://hr-dms-46nt.vercel.app` → Should show the login page ✅

---

## 🔁 Future Deployments (Auto)

Every push to `main` triggers an automatic redeploy:

```powershell
git add -A
git commit -m "your changes"
git push origin main
```

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `404: NOT_FOUND` after "Ready" | Output Directory set to `dist` | Clear it in Settings → General |
| `api/server.js not found` build fail | `vercel.json` exists with old config | Delete `vercel.json` |
| `Cannot find module 'nitro/config'` | `nitro.config.ts` exists | Delete `nitro.config.ts` |
| Firebase errors in production | Env vars missing | Add all `VITE_*` vars in Settings → Environment Variables |

---

## 📁 Final File Checklist

```
hr_dms/
├── vite.config.ts     ✅ Only tanstackStart.server.entry = "server"
├── package.json       ✅ build = "vite build"
├── src/server.ts      ✅ Original, untouched
├── vercel.json        ❌ Must NOT exist
├── nitro.config.ts    ❌ Must NOT exist
└── .env               ✅ Local only — DO NOT commit
```

---

## 🌐 How It Works

```
git push → Vercel detects push
         ↓
    npm install
         ↓
    npm run build  (vite build → Nitro runs inside)
         ↓
    NITRO_PRESET=vercel → outputs to .vercel/output/
    ├── functions/  (SSR serverless handler)
    └── static/     (CSS, JS, images)
         ↓
    Vercel auto-detects .vercel/output/
         ↓
    🚀 Live!
```

---

*Last updated: June 2026*
