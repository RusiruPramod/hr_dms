# 🧹 Migration Cleanup Checklist

## ✅ Phase 1: Delete Old TanStack Files

Before running `npm install`, delete these files/folders completely:

### Backend/Server Files to Delete
```bash
# Server entry points (no longer needed)
rm -rf api/
rm src/server.ts
rm src/start.ts
rm src/routeTree.gen.ts
rm server.mjs
```

### Server-Only Library Files
```bash
# These are server-only - remove entirely
rm src/lib/auth-server.ts
rm src/lib/firebase-admin.ts
rm src/lib/config.server.ts
```

### TanStack-Specific Files
```bash
# These will cause conflicts
rm bunfig.toml  # Bun + TanStack specific config
```

### Old Route Files (Will be replaced with new React Router versions)
```bash
# Keep the src/routes/ folder, but update contents
# Old route files should be replaced:
- src/routes/login.tsx → ✅ ALREADY UPDATED
- src/routes/__root.tsx → ❌ DELETE (not used in React Router)
- src/routes/index.tsx → replaced by src/routes/Home.tsx
- src/routes/records.index.tsx → replaced by src/routes/Records.tsx
- src/routes/records.$id.tsx → replaced by src/routes/RecordDetails.tsx
- src/routes/records.new.tsx → replaced by src/routes/RecordNew.tsx
- src/routes/nda.tsx → ✅ ALREADY UPDATED
- src/routes/offer-letter.tsx → ✅ ALREADY UPDATED
```

---

## ✅ Phase 2: Verify Configuration Updates

Check these files have been properly updated:

- [ ] `package.json` - No `@tanstack/react-start`, `@tanstack/react-router`, or `nitro`
- [ ] `vite.config.ts` - Uses standard Vite + React setup (not `@lovable.dev/vite-tanstack-config`)
- [ ] `tsconfig.json` - Simplified, no TanStack types
- [ ] `vercel.json` - Has `outputDirectory: "dist"` and `rewrites` for SPA
- [ ] `index.html` - New file created with correct script reference

---

## ✅ Phase 3: Verify New Files Exist

New files created for React Router + Vite setup:

- [ ] `index.html` - Root HTML template
- [ ] `src/main.tsx` - Entry point
- [ ] `src/App.tsx` - Router setup with React Router
- [ ] `src/routes/Login.tsx` - Login page (React Router version)
- [ ] `src/routes/Home.tsx` - Dashboard (React Router version)
- [ ] `src/routes/Records.tsx` - Records table (React Router version)
- [ ] `src/routes/RecordDetails.tsx` - Edit record page (React Router version)
- [ ] `src/routes/RecordNew.tsx` - New record page (React Router version)
- [ ] `src/routes/404.tsx` - Not found page
- [ ] `src/routes/NDA.tsx` - NDA document generator (React Router version)
- [ ] `src/routes/OfferLetter.tsx` - Offer letter generator (React Router version)

---

## ✅ Phase 4: Install Dependencies

```bash
# Clear old dependencies
rm -rf node_modules/
rm package-lock.json  # or bun.lockb if using Bun

# Install new dependencies
npm install

# Or if using Bun:
bun install
```

---

## ✅ Phase 5: Test Build Process

```bash
# Verify ESLint passes
npm run lint

# Verify TypeScript compiles
# (This happens during build)

# Build the project
npm run build

# Should output to dist/ folder
# Verify no errors in console
```

---

## ✅ Phase 6: Test Local Development

```bash
# Start dev server
npm run dev

# Should start on http://localhost:5173
# Test these routes manually:
- http://localhost:5173/ → redirects to /records
- http://localhost:5173/login → login page
- http://localhost:5173/records → records table (after login)
- http://localhost:5173/nda → NDA generator (after login)
- http://localhost:5173/offer-letter → Offer letter generator (after login)
- http://localhost:5173/nonexistent → 404 page
```

---

## ✅ Phase 7: Environment Variables Setup

Create `.env.local` for local development:

```env
VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

---

## ✅ Phase 8: Test Firebase Integration

- [ ] Firebase initialization loads without errors
- [ ] Login with email/password works
- [ ] Create new account works
- [ ] Can read data from Firestore
- [ ] Can write data to Firestore
- [ ] Can upload files to Storage

---

## ✅ Phase 9: Verify No Old Imports Remain

Search codebase for old TanStack imports:

```bash
# Should return NO results:
grep -r "@tanstack/react-router" src/
grep -r "@tanstack/react-start" src/
grep -r "createFileRoute" src/
grep -r "createRootRoute" src/
grep -r "serverFn" src/
grep -r "useServerFn" src/
```

---

## ✅ Phase 10: Prepare for Deployment

```bash
# Final production build
npm run build

# Test production build locally
npm run preview

# Visit http://localhost:4173
# Test all routes and features

# If everything works, commit to Git
git add -A
git commit -m "Migrate from TanStack Start to Vite + React Router + Firebase"
git push origin main
```

---

## ✅ Phase 11: Deploy to Vercel

1. **Connect GitHub Repository** (if not already connected)
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework Preset: `Vite`
   - Root Directory: `./` (default)

3. **Add Environment Variables**
   - Go to **Settings → Environment Variables**
   - Add all `VITE_FIREBASE_*` variables
   - Ensure they match your Firebase project

4. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Monitor deployment in Vercel dashboard
   - Check build logs for errors

5. **Test Live Deployment**
   - Visit your Vercel URL (e.g., `https://hr-dms.vercel.app`)
   - Test login, create record, generate documents
   - Check browser console for errors
   - Monitor Vercel logs

---

## 🔍 Troubleshooting

### Issue: "Module not found: @tanstack/react-router"
**Solution**: Ensure all `src/routes/*.tsx` files use `react-router-dom` imports, not TanStack imports.

### Issue: "Cannot find module './dist/server/server.js'"
**Solution**: This error is from old `server.mjs`. Delete it and run `npm run build` again.

### Issue: Build fails with ESLint errors
**Solution**: Run `npm run lint -- --fix` to auto-fix issues.

### Issue: Routes show 404 on Vercel
**Solution**: Ensure `vercel.json` has the `rewrites` section pointing to `/index.html`.

### Issue: Firebase not initializing
**Solution**: Check `.env.local` (locally) or Vercel Environment Variables have all `VITE_FIREBASE_*` keys.

### Issue: Vite build much larger than expected
**Solution**: 
- Check for unused dependencies
- Run `npm run build` with `--report` flag to see bundle size
- Remove unused UI components from dependencies

---

## 📋 Final Verification Checklist

- [ ] All TanStack files deleted
- [ ] All new React Router files created
- [ ] `package.json` updated
- [ ] `vite.config.ts` updated
- [ ] `tsconfig.json` updated
- [ ] `vercel.json` updated
- [ ] `index.html` created
- [ ] `src/main.tsx` created
- [ ] `src/App.tsx` created with Router setup
- [ ] All route files converted to React Router
- [ ] No TanStack imports in codebase
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works and routes function
- [ ] Firebase integration works
- [ ] `.env.local` has all Firebase keys
- [ ] Deployed to Vercel
- [ ] Live deployment tested and working

---

## 🎉 You're Done!

Your project is now migrated to:
- ✅ **Frontend**: Vite + React Router v6
- ✅ **Backend**: Firebase only (Auth, Firestore, Storage)
- ✅ **Deployment**: Vercel (simple static hosting)
- ✅ **No server complexity**: Pure SPA architecture

**Next Steps:**
1. Monitor Vercel logs for any runtime errors
2. Test all features in production
3. Update documentation for team members
4. (Optional) Delete old backup branch

---

**Questions? Check the MIGRATION_GUIDE.md for detailed step-by-step instructions.**
