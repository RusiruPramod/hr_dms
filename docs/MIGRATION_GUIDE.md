# 🔄 TanStack Start → Vite + Firebase Migration Guide

## 📋 Overview

This guide walks you through migrating your HR DMS project from TanStack Start (with Nitro server) to a **pure Vite frontend + Firebase backend** setup, ready for Vercel deployment.

### What's Changing
- ❌ **REMOVE**: TanStack Start, TanStack Router, Nitro, server-side SSR
- ✅ **ADD**: React Router v6, pure frontend Vite build
- ✅ **KEEP**: Firebase (Auth, Firestore, Storage), Tailwind CSS, UI components

---

## 📊 Before & After Architecture

### Before (Current - TanStack Start)
```
Client (React) → TanStack Router → Server (Nitro) → Firebase
                ↑                  ↓
         Browser requests    SSR + API routes
```

### After (New - Vite + Firebase)
```
Vite Build → Static SPA (HTML/CSS/JS) → Deployed on Vercel
         ↓
React Router + React Components
         ↓
         Firebase SDK (Direct client calls)
         ↓
         Firebase Backend (Auth, Firestore, Storage)
```

---

## 🛠️ Step-by-Step Migration Plan

### Phase 1: Setup & Dependencies

#### Step 1.1: Update package.json
Remove TanStack packages and add React Router.

**Dependencies to REMOVE:**
- `@tanstack/react-start`
- `@tanstack/react-router`
- `@lovable.dev/vite-tanstack-config`
- `nitro`
- `firebase-admin` (server-only, will remove)

**Dependencies to ADD:**
- `react-router-dom` (simple routing)
- Keep all UI, Firebase client, and other libs

**Update scripts:**
- `dev`: `vite` (instead of `vite dev`)
- `build`: `vite build` (outputs to `dist/`)
- `preview`: `vite preview`

---

#### Step 1.2: Update vite.config.ts

**Remove TanStack complexity, use simple Vite + React setup:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

---

#### Step 1.3: Update tsconfig.json

Remove TanStack Start references, keep it simple:

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"],
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

#### Step 1.4: Update vercel.json

**Remove all server routing** - Vercel will serve static `dist/` folder:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev"
}
```

That's it! No API routes, no rewrites. Vercel serves your static frontend.

---

### Phase 2: Project Structure Cleanup

#### Step 2.1: Delete These Folders/Files
```
❌ api/                    (no more server routes)
❌ src/server.ts           (no more server entry)
❌ src/start.ts            (no more TanStack Start)
❌ src/routeTree.gen.ts    (no more generated routes)
❌ server.mjs              (no more server handler)
❌ bunfig.toml             (specific to bun+TanStack)
❌ src/lib/auth-server.ts  (no more server auth - use client only)
❌ src/lib/firebase-admin.ts (no more server-side Firebase)
```

#### Step 2.2: New Folder Structure
```
hr_dms/
├── src/
│   ├── main.tsx              ✨ NEW - Entry point
│   ├── index.html            ✨ NEW - HTML template
│   ├── App.tsx               ✨ NEW - Root component with Router
│   ├── routes/
│   │   ├── Home.tsx          (rename from routes/index.tsx)
│   │   ├── Login.tsx         (rename + simplify from routes/login.tsx)
│   │   ├── Records.tsx       (rename from routes/records.index.tsx)
│   │   ├── RecordDetails.tsx (rename from routes/records.$id.tsx)
│   │   ├── RecordNew.tsx     (rename from routes/records.new.tsx)
│   │   ├── NDA.tsx
│   │   ├── OfferLetter.tsx
│   │   └── 404.tsx           ✨ NEW - Not found page
│   ├── components/           (same as before)
│   ├── lib/
│   │   ├── firebase.ts       (keep, client-only)
│   │   ├── types.ts          (keep)
│   │   ├── utils.ts          (keep)
│   │   ├── format.ts         (keep)
│   │   ├── pdf.ts            (keep)
│   │   ├── interns.ts        (keep)
│   │   ├── company.ts        (keep)
│   │   └── config.server.ts  (DELETE - not needed client-side)
│   ├── hooks/                (keep)
│   ├── assets/               (keep)
│   └── styles.css            (keep)
├── public/                   (if you have static assets)
├── vite.config.ts            ✨ UPDATED
├── tsconfig.json             ✨ UPDATED
├── package.json              ✨ UPDATED
├── vercel.json               ✨ UPDATED
├── index.html                ✨ NEW
├── .gitignore                (add /dist)
└── docs/
    └── MIGRATION_GUIDE.md    (this file)
```

---

### Phase 3: Create New Entry Point Files

#### Step 3.1: Create `index.html` (Root HTML)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HR Document Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### Step 3.2: Create `src/main.tsx` (Entry Point)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### Step 3.3: Create `src/App.tsx` (Router Setup)

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'

// Pages
import Login from './routes/Login'
import Home from './routes/Home'
import Records from './routes/Records'
import RecordDetails from './routes/RecordDetails'
import RecordNew from './routes/RecordNew'
import NDA from './routes/NDA'
import OfferLetter from './routes/OfferLetter'
import NotFound from './routes/404'

// Layout
import { SidebarProvider } from '@/components/ui/sidebar'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/records" replace />} />
          
          {/* Protected routes wrapped in layout */}
          <Route
            path="/records"
            element={
              <SidebarProvider>
                <AppLayout>
                  <Records />
                </AppLayout>
              </SidebarProvider>
            }
          />
          <Route
            path="/records/:id"
            element={
              <SidebarProvider>
                <AppLayout>
                  <RecordDetails />
                </AppLayout>
              </SidebarProvider>
            }
          />
          <Route
            path="/records/new"
            element={
              <SidebarProvider>
                <AppLayout>
                  <RecordNew />
                </AppLayout>
              </SidebarProvider>
            }
          />
          <Route path="/nda" element={<NDA />} />
          <Route path="/offer-letter" element={<OfferLetter />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

// Simple layout wrapper
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default App
```

---

### Phase 4: Migrate Route Components

#### Step 4.1: Convert TanStack Routes to React Router

**Pattern:**
```typescript
// BEFORE (TanStack)
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/login')({
  component: LoginComponent,
})

// AFTER (React Router)
import { useNavigate } from 'react-router-dom'
export default function LoginComponent() {
  const navigate = useNavigate()
  // ... rest of component
}
```

#### Step 4.2: Update Hook Usage

```typescript
// Navigation
- import { useNavigate } from '@tanstack/react-router'
+ import { useNavigate } from 'react-router-dom'

// URL params
- import { useParams } from '@tanstack/react-router'
+ import { useParams } from 'react-router-dom'

// Links
- import { Link } from '@tanstack/react-router'
+ import { Link } from 'react-router-dom'
```

#### Step 4.3: Remove Server-Side Logic

Delete any usage of:
- `beforeLoad()` - Replace with client-side auth checks in component
- `serverFn()` - Call Firebase directly from client
- `useServerFn()` - Not needed anymore

**Example: Protected Route Pattern**

```typescript
// BEFORE (TanStack server-side redirect)
export const Route = createFileRoute('/records')({
  beforeLoad: async () => {
    const user = getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
})

// AFTER (React Router client-side check)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Records() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) return <Spinner />
  if (!user) return null

  return <RecordsContent />
}
```

---

### Phase 5: Firebase Integration Cleanup

#### Step 5.1: Keep Client-Side Firebase

The `src/lib/firebase.ts` stays **as-is** - it's purely client-side:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app
try {
  app = initializeApp(cfg)
} catch (err) {
  console.warn('Firebase init warning:', err)
}

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId)
export { app }
export default app
```

#### Step 5.2: Update useAuth Hook

Make sure it's client-only:

```typescript
import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}

export function getCurrentUser() {
  return auth.currentUser
}
```

#### Step 5.3: DELETE These Files

```
❌ src/lib/auth-server.ts (server-only verification)
❌ src/lib/firebase-admin.ts (server-only Firebase Admin SDK)
❌ src/lib/config.server.ts (server config)
❌ api/ folder (all server functions)
```

---

### Phase 6: Update Environment Variables

Create `.env.local` for development:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For Vercel deployment, set these same variables in **Project Settings → Environment Variables**.

---

### Phase 7: Update Vercel Deployment

#### Step 7.1: Vercel Dashboard Setup

1. **Connect GitHub repo**
2. Go to **Settings → Build & Development**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Go to **Settings → Environment Variables**
   - Add all `VITE_FIREBASE_*` variables
4. **No need for API routes** - Vercel will just serve your `dist` folder
5. **Deploy** - Commit and push to main branch

#### Step 7.2: Rewrite Rules (Optional)

If you need SPA routing to work (e.g., `/records` shouldn't 404), add to `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router handles all routes, not Vercel's static file server.

---

## 📝 Execution Checklist

### Pre-Migration (Current State)
- [ ] Commit current code to Git
- [ ] Create a backup branch: `git checkout -b backup/tanstack-start`
- [ ] Push backup: `git push -u origin backup/tanstack-start`
- [ ] Return to main: `git checkout main` or `dev`

### Step 1: Delete TanStack Files
- [ ] Delete `api/` folder
- [ ] Delete `src/server.ts`
- [ ] Delete `src/start.ts`
- [ ] Delete `src/routeTree.gen.ts`
- [ ] Delete `server.mjs`
- [ ] Delete `src/lib/auth-server.ts`
- [ ] Delete `src/lib/firebase-admin.ts`
- [ ] Delete `src/lib/config.server.ts`
- [ ] Delete `bunfig.toml`

### Step 2: Create New Files
- [ ] Create `index.html`
- [ ] Create `src/main.tsx`
- [ ] Create `src/App.tsx`

### Step 3: Update Config Files
- [ ] Update `package.json` (remove TanStack deps, add React Router)
- [ ] Update `vite.config.ts`
- [ ] Update `tsconfig.json`
- [ ] Update `vercel.json`

### Step 4: Install Dependencies
- [ ] Run `npm install` or `bun install`
- [ ] Verify no errors: `npm run lint`

### Step 5: Migrate Routes
- [ ] Create `src/routes/` folder
- [ ] Convert `index.tsx` → `src/routes/Home.tsx`
- [ ] Convert `login.tsx` → `src/routes/Login.tsx`
- [ ] Convert `records.index.tsx` → `src/routes/Records.tsx`
- [ ] Convert `records.$id.tsx` → `src/routes/RecordDetails.tsx`
- [ ] Convert `records.new.tsx` → `src/routes/RecordNew.tsx`
- [ ] Create `src/routes/404.tsx`
- [ ] Create `src/routes/NDA.tsx` and `OfferLetter.tsx`

### Step 6: Test Locally
- [ ] Run `npm run dev`
- [ ] Test all routes: `/`, `/login`, `/records`, etc.
- [ ] Test auth flow (login, logout)
- [ ] Test Firebase operations (read/write to Firestore)
- [ ] Run `npm run build` - should succeed
- [ ] Run `npm run preview` - test production build

### Step 7: Deploy to Vercel
- [ ] Commit all changes
- [ ] Push to main: `git push origin main`
- [ ] Vercel auto-deploys
- [ ] Test on live Vercel URL
- [ ] Test all routes and Firebase operations

### Post-Migration (Cleanup)
- [ ] Delete old backup branch (optional)
- [ ] Monitor Vercel logs for any errors
- [ ] Update documentation

---

## 🚨 Common Issues & Fixes

### Issue 1: "Cannot find module '@tanstack/react-router'"
**Solution**: Make sure all imports are updated to `react-router-dom`

```typescript
// ❌ WRONG
import { useNavigate } from '@tanstack/react-router'

// ✅ CORRECT
import { useNavigate } from 'react-router-dom'
```

### Issue 2: Vite build fails with CSS errors
**Solution**: Ensure `@tailwindcss/vite` is in `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Issue 3: Firebase not initializing
**Solution**: Check `.env.local` has all `VITE_FIREBASE_*` variables

```bash
echo "VITE_FIREBASE_API_KEY=..." >> .env.local
```

### Issue 4: Routes showing 404 on Vercel
**Solution**: Ensure `vercel.json` has rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue 5: Firebase Auth not persisting
**Solution**: Make sure `onAuthStateChanged` is called early in App:

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, setUser)
  return () => unsubscribe()
}, [])
```

---

## 📦 Updated package.json (Complete)

See the separate `UPDATED_PACKAGE.json` file in `docs/` folder.

---

## 🎯 Final Result

After migration:

✅ **Frontend**: Pure React + Vite (no server complexity)
✅ **Routing**: React Router v6 (simple, standard)
✅ **Backend**: Firebase only (no custom servers)
✅ **Deployment**: Vercel (automatic from GitHub)
✅ **Build Size**: Smaller (no Nitro/SSR overhead)
✅ **Performance**: Faster (Vite builds quickly, Vercel serves static)
✅ **Beginner-Friendly**: Standard React + Firebase patterns

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [Firebase Web SDK](https://firebase.google.com/docs/web)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Good luck with the migration! 🚀**
