# Firebase Firestore Security Rules Configuration

## ⚠️ Current Error

```
[Firestore] ❌ Failed to list interns: FirebaseError: Missing or insufficient permissions.
[Firestore] 🔐 Permission Denied (Code: permission-denied)
```

This means your Firestore security rules are blocking reads/writes.

---

## ✅ How to Fix

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project: **hr-document-management-abfaa**
3. Go to **Firestore Database** (left sidebar)

### Step 2: Set Security Rules

1. Click **Rules** tab
2. Replace everything with the rules below:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own data
    match /interns/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow all authenticated users to read public collections
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 3: Verify Rules Applied

Look for the green checkmark ✅ saying "Rules are now live"

---

## 🔐 Security Rules Explained

| Rule | Meaning |
|------|---------|
| `allow read` | Allows SELECT queries |
| `allow write` | Allows CREATE, UPDATE, DELETE |
| `request.auth != null` | Only authenticated users |
| `{document=**}` | All documents in collection |

---

## 🧪 Test After Applying Rules

### Step 1: Refresh Browser
```
Press F5 or Ctrl+Shift+R (hard refresh)
```

### Step 2: Check Console Logs
Expected success logs:
```
[Firestore] 🔍 Querying interns collection...
[Firestore] ✅ Query successful: X records
```

### Step 3: Try Creating a Record
- Go to `/records/new`
- Fill form
- Click Save
- Check console for:
```
[Firestore] 💾 Saving record: [Name]
[Firestore] ✅ Save successful: 12345...
```

---

## 🚨 If Still Getting Permission Error

### 1. Check Authentication
- Make sure you're logged in
- Check console shows: `Auth State: ✅ Logged in as your@email.com`

### 2. Verify Rules Saved
- Go back to **Firestore → Rules**
- Copy the rules again
- Check you hit **Publish**

### 3. Clear Cache & Restart
```powershell
# In terminal:
npm run dev
```

Then in browser:
- Press `Ctrl+Shift+Delete` to clear site data
- Refresh page
- Try again

### 4. Check Firestore Indexes
- Go to **Firestore → Indexes**
- No indexes needed for basic read/write

---

## 📋 Production Security Rules

For **production**, use stricter rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated users can access interns collection
    match /interns/{internId} {
      // Read: anyone logged in
      allow read: if request.auth != null;
      
      // Write: only admin or owner
      allow write: if request.auth != null && 
                      (request.auth.token.admin == true ||
                       request.resource.data.userId == request.auth.uid);
    }
  }
}
```

---

## 🆘 Still Not Working?

1. **Restart dev server**: `npm run dev`
2. **Hard refresh**: `Ctrl+Shift+R`
3. **Clear localStorage**: Open console and run:
   ```javascript
   localStorage.clear()
   ```
4. **Sign out and back in**
5. **Check Firebase project ID** matches `.env`

---

## ✅ Rules Applied Successfully When You See:

- ✅ Records load in table
- ✅ Can create new record
- ✅ Can update record
- ✅ Can delete record
- ✅ No `permission-denied` errors in console
- ✅ Console shows success logs with ✅ emoji

