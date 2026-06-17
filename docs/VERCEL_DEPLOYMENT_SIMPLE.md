# 🚀 Vercel Deployment Guide (Vite + Firebase)

## Overview

Your Vite + Firebase project is now ready for Vercel. This guide explains the deployment process and post-deployment testing.

---

## Prerequisites

Before deploying, ensure:

- [ ] GitHub repository is up to date with all migration changes
- [ ] Local build succeeds: `npm run build`
- [ ] `.env.local` has all `VITE_FIREBASE_*` variables (for local testing)
- [ ] All routes work locally: `npm run dev`
- [ ] No console errors in browser

---

## Step 1: Connect Repository to Vercel

### Option A: First-Time Setup

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub account and find `hr_dms` repository
5. Click **"Import"**

### Option B: Already Connected

Skip to Step 2 if your repository is already in Vercel.

---

## Step 2: Configure Build Settings

### In Vercel Dashboard

1. After importing, you'll see the **Configure Project** screen
2. Set these values:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |
   | **Node Version** | `18.x` or higher |

3. Keep **Root Directory** as `./` (default)
4. Click **"Deploy"**

---

## Step 3: Add Environment Variables

### In Vercel Dashboard

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add each variable:

```
Key: VITE_FIREBASE_API_KEY
Value: <your_firebase_api_key>

Key: VITE_FIREBASE_AUTH_DOMAIN
Value: <your_project>.firebaseapp.com

Key: VITE_FIREBASE_PROJECT_ID
Value: <your_project_id>

Key: VITE_FIREBASE_STORAGE_BUCKET
Value: <your_project>.appspot.com

Key: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: <your_sender_id>

Key: VITE_FIREBASE_APP_ID
Value: <your_app_id>
```

4. Select environment: **Production** (default)
5. Click **Save**

### Important

- **DO NOT commit `.env.local` to Git** (it's in `.gitignore`)
- Vercel's environment variables are automatically injected at build time
- They're available to your React app as `import.meta.env.VITE_*`

---

## Step 4: Deploy

### Automatic Deployment

After configuring environment variables:

1. Any push to your `main` branch auto-deploys
2. Vercel shows deployment status in dashboard
3. Deployment typically takes 1-2 minutes

### Manual Deployment (if needed)

```bash
git push origin main
```

---

## Step 5: Verify Deployment

### Check Vercel Dashboard

1. Go to your project in [Vercel](https://vercel.com)
2. Look for recent deployment
3. Click deployment to see:
   - Build logs
   - Status (✅ Success or ❌ Failed)
   - Deployment URL

### Test Live Application

1. Click **Visit** button to open your live URL
2. Test these flows:

#### Test 1: Authentication
```
- Navigate to /login
- Create new account (any email/password)
- Should redirect to /records after login
- Check browser console for errors
```

#### Test 2: Records Page
```
- Verify records table loads
- Try search/filter
- Click "New Record" button
- Try creating a record
- Verify data saves to Firestore
```

#### Test 3: Document Generation
```
- Go to /nda or /offer-letter
- Select an intern from dropdown
- Verify PDF export works
- Download and check PDF content
```

#### Test 4: Navigation & 404
```
- Click different links in sidebar
- Try accessing /nonexistent
- Should show 404 page
```

---

## Post-Deployment Troubleshooting

### Issue 1: Blank White Page

**Check:**
1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab - verify `index.html`, `main.*.js` loaded

**Common causes:**
- Environment variables not set → add them in Vercel Settings
- Firebase initialization failed → check Firebase config in environment
- TypeScript errors → check Vercel build logs

**Fix:**
```bash
# In Vercel Dashboard, click deployment → "View Build Logs"
# Look for errors during build
# Fix locally and push again
```

### Issue 2: 404 on All Routes (except home)

**Cause:** SPA routing not configured

**Fix:**
1. Check `vercel.json` has rewrites section:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. If missing, add it and push again:
```bash
git add vercel.json
git commit -m "Add SPA rewrite rule"
git push origin main
```

### Issue 3: Firebase Not Working (Auth/Data Read/Write Failed)

**Check:**
1. Firestore Security Rules allow reading/writing
2. Firebase environment variables are set correctly
3. Browser console shows no CORS errors

**Fix:**
1. Verify environment variables in Vercel:
   - Go to **Settings → Environment Variables**
   - Ensure all `VITE_FIREBASE_*` variables are present
   - Redeploy: **Deployments → Latest → Redeploy**

2. Check Firestore rules (Firebase Console):
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write for now (development only!)
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

3. Check Storage rules if uploading files:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Issue 4: Build Fails

**Check build logs:**
1. In Vercel Dashboard, click failed deployment
2. Scroll down to **Build Logs**
3. Look for error messages

**Common errors:**
- `npm: command not found` → Node version issue
- TypeScript errors → Run `npm run build` locally to debug
- Missing imports → Check all files have correct imports

**Fix:**
1. Fix error locally
2. Test: `npm run build && npm run preview`
3. Commit and push:
```bash
git add -A
git commit -m "Fix build error"
git push origin main
```

### Issue 5: Slow Performance

**Optimization:**
1. Check bundle size:
   ```bash
   npm run build
   # Check console output for chunk sizes
   ```

2. Remove unused packages from `package.json`

3. Lazy load routes (optional):
   ```typescript
   import { lazy, Suspense } from 'react'
   const Records = lazy(() => import('./routes/Records'))
   
   <Suspense fallback={<div>Loading...</div>}>
     <Records />
   </Suspense>
   ```

---

## Continuous Deployment Workflow

### Daily Workflow

```bash
# Make changes locally
git add .
git commit -m "Feature: Add new feature"

# Push to GitHub
git push origin main

# Vercel auto-deploys
# Monitor in dashboard
```

### Staging Deployments (Optional)

Create a `staging` branch for testing before production:

```bash
# Create staging branch
git checkout -b staging

# Make changes, test locally
npm run dev

# Deploy staging to preview URL
git push -u origin staging

# In Vercel: Configure staging branch
# Settings → Git → Production Branch: main, Preview Branches: staging
```

---

## Monitoring & Maintenance

### Enable Analytics (Optional)

1. In Vercel Dashboard, go to **Analytics**
2. Enable Real Experience Scores
3. Monitor:
   - Page load times
   - Edge location performance
   - Errors

### Set Up Error Notifications (Optional)

1. Go to **Settings → Notifications**
2. Enable Slack, Discord, or email notifications for:
   - Deployment failed
   - Deployment completed

### Regular Maintenance

**Weekly:**
- Check Vercel logs for errors
- Monitor Firebase usage
- Test all major features

**Monthly:**
- Review bundle size
- Update dependencies: `npm outdated`
- Check for security vulnerabilities: `npm audit`

---

## Rollback Instructions

If deployment breaks production:

### Quick Rollback

1. In Vercel Dashboard → **Deployments**
2. Find last working deployment (green checkmark)
3. Click **Promote to Production**
4. Confirm rollback

### Manual Rollback via Git

```bash
# Find last good commit
git log --oneline | head -20

# Revert to good commit
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

---

## Environment-Specific Configuration

### Development (.env.local - NOT in Git)
```env
VITE_FIREBASE_API_KEY=dev_key
VITE_FIREBASE_PROJECT_ID=dev_project
```

### Production (Vercel Environment Variables)
```
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_PROJECT_ID=prod_project
```

---

## Performance Tips

1. **CDN Caching**: Vercel automatically caches assets
2. **Code Splitting**: Vite does this by default
3. **Image Optimization**: Use Next.js Image component or similar (optional)
4. **Database Indexing**: Create Firestore indexes for frequently queried fields

---

## Security Best Practices

1. ✅ **Firebase Security Rules**: Restrictive by default
2. ✅ **Environment Variables**: Never commit `.env` files
3. ✅ **CORS**: Firebase SDK handles CORS automatically
4. ✅ **Authentication**: Use Firebase Auth for access control
5. ✅ **API Keys**: Use Firebase public API keys (safe in browser)

---

## FAQ

**Q: How often does Vercel check for updates?**
A: Automatically on every push to configured branches (typically main).

**Q: Can I have multiple environments?**
A: Yes - create `staging` or `dev` branches and configure in Vercel Settings.

**Q: How do I see build logs?**
A: Dashboard → Click deployment → scroll to "Build Logs"

**Q: Can I use custom domain?**
A: Yes - Settings → Domains. Add your domain and follow DNS setup.

**Q: What's the cost?**
A: Vercel free tier includes: 100GB bandwidth, unlimited serverless functions. Perfect for this SPA.

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Router Docs**: https://reactrouter.com

---

## Deployment Checklist

- [ ] GitHub repository connected to Vercel
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] All environment variables added
- [ ] First deployment successful (✅ green)
- [ ] Live URL accessible
- [ ] Login works
- [ ] Records load from Firestore
- [ ] Document generation works
- [ ] No console errors in browser
- [ ] Performance is acceptable (<3s load)

---

**You're ready to deploy! 🚀**
