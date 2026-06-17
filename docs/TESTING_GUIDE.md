# Firebase & Data Flow Testing Guide

## 🚀 Quick Start Testing

### Step 1: Open Developer Console
1. Open app in browser
2. Press `F12` → Go to **Console** tab
3. You'll see colored logs: 🔵 Info, ⚠️ Warning, ❌ Error

---

## 📋 Test Case 1: Check Firebase Connection

### What to Test
✅ Firebase initialized correctly  
✅ Can connect to Firestore  
✅ Environment variables loaded  

### How to Test
```javascript
// Paste in Console:
import { checkFirebaseStatus } from '@/lib/firebase-status'
checkFirebaseStatus()
```

### Expected Output
```
🔍 Firebase Status Check Started...
==================================================

1️⃣ CONFIGURATION STATUS:
   Firebase Enabled: ✅ YES
   Auth State: ✅ Logged in as your@email.com

2️⃣ FIRESTORE CONNECTION:
   ✅ Connected to Firestore
   📊 Total records found: at least 1

3️⃣ LOCALSTORAGE FALLBACK:
   ✅ Local cache exists with X records

4️⃣ AUTHENTICATION:
   Current User: your@email.com
   User ID: xxxxx
```

### If Something is Wrong
- ❌ **Firebase Enabled: NO** → Check `.env` file for credentials
- ❌ **Firestore Connection Failed** → Check Firebase project settings
- ⚠️ **Not logged in** → Sign up/login first

---

## 📊 Test Case 2: Create New Record & Monitor Data Flow

### Step 1: Go to Create Record Page
```
Navigate to: /records/new
```

### Step 2: Fill Form
- Full Name: `Test User 2024`
- NIC: `123456789012`
- Department: `Engineering`
- Start Date: `2024-01-15`
- End Date: `2024-06-15`
- Supervisor: `John Doe`
- Phone: `0771234567`
- Address: `123 Main St`

### Step 3: Watch Console While Saving
Click **Save** and watch the console for:

```
[Firebase] 💾 Saving intern: Test User 2024
[Firebase] 📡 Fetching interns from Firestore...
[Firestore] 🔍 Querying interns collection...
[Firestore] ✅ Query successful: 5 records
[Firebase] ✅ Successfully saved: 1708...
[Firebase] ✅ Fetched 5 records
[LocalStorage] 📦 Loaded 5 records from cache
```

### Expected Result
- ✅ Record appears in table on `/records`
- ✅ Can see record ID in console
- ✅ Timestamp is today
- ✅ All logs show ✅ SUCCESS

---

## 🔄 Test Case 3: Update Existing Record

### Step 1: Go to Any Record
```
Click on any record in /records table
```

### Step 2: Edit a Field
- Change supervisor name
- Update phone number

### Step 3: Watch Console
Click **Save** and look for:

```
[Firebase] 💾 Saving intern: [Name]
[Firestore] 💾 Saving record: [Name] { isUpdate: true }
[Firestore] ✅ Save successful: 1708...
[Firebase] ✅ Successfully saved: 1708...
[LocalStorage] 📦 Saved to cache: 1708...
```

### Expected Result
- ✅ Record updates immediately
- ✅ `updatedAt` timestamp changes
- ✅ No errors in console

---

## 🗑️ Test Case 4: Delete Record

### Step 1: Find a Record
```
Go to /records → Find test record
```

### Step 2: Click Delete
Click the trash icon

### Step 3: Confirm Deletion
Click **Delete** in confirmation dialog

### Step 4: Watch Console
```
[LocalStorage] 🗑️ Deleting record: 1708...
[Firestore] 🗑️ Deleting from Firestore: 1708...
[Firestore] ✅ Delete successful: 1708...
```

### Expected Result
- ✅ Record disappears from table
- ✅ No errors in console
- ✅ Logs show successful deletion

---

## 🌐 Test Case 5: Offline Mode (Fallback to localStorage)

### Step 1: Open Network Tab
- Press F12 → Go to **Network** tab

### Step 2: Go Offline
- Check **Offline** box

### Step 3: Create a Record
- Navigate to `/records/new`
- Fill form
- Click **Save**

### Step 4: Watch Console
```
[Firebase] 💾 Saving intern: Test Offline
[Firebase] ⚠️ Save failed, falling back to localStorage: Network error
[LocalStorage] 📦 Saved to cache: 1708...
```

### Step 5: Go Back Online
- Uncheck **Offline** box
- Refresh page

### Expected Result
- ✅ Record still exists in table (from cache)
- ✅ When online, Firebase syncs automatically
- ✅ No data loss

---

## 📄 Test Case 6: Offer Letter Preview & Export

### Step 1: Go to Offer Letter Page
```
Navigate to: /offer-letter
```

### Step 2: Select Intern
- Click dropdown
- Select from existing records

### Step 3: Watch Preview
- Preview updates in real-time
- All intern details populate correctly

### Step 4: Export PDF
- Click **Export PDF**
- PDF downloads

### Expected Result
- ✅ Preview shows all data
- ✅ PDF downloads without error
- ✅ Console shows no errors

---

## 🔐 Test Case 7: Authentication Flow

### Step 1: Logout
- Click **Logout** in sidebar

### Step 2: Go to /records
- Try navigating directly to `/records`

### Expected Result
- ✅ Redirected to `/login`
- ⚠️ Cannot access protected routes

### Step 3: Login with New Account
- Email: `test@example.com`
- Password: `password123`
- Click **Sign in**

### Expected Result
- ✅ Successfully logged in
- ✅ Can access all protected routes
- ✅ See Firebase logs on successful auth

---

## 📊 Console Log Legend

| Log | Meaning | Status |
|-----|---------|--------|
| `[Firebase]` | Client-side Firebase wrapper | 📡 Network |
| `[Firestore]` | Direct Firestore database operation | 🔥 Database |
| `[Storage]` | Firebase Storage file operation | 📦 Files |
| `[LocalStorage]` | Browser cache fallback | 💾 Offline |
| ✅ | Success | OK |
| ⚠️ | Warning/Fallback | OK (with fallback) |
| ❌ | Error | NOT OK |

---

## 🐛 Troubleshooting

### Problem: "Firebase Connection Failed"
**Solution:**
1. Check `.env` file has all credentials
2. Verify Firebase project ID matches `.env`
3. Check Firebase project settings are correct
4. Restart dev server: `npm run dev`

### Problem: Data Not Saving
**Solution:**
1. Check browser console for error messages
2. Check Firebase Firestore security rules allow writes
3. Check user is authenticated
4. Try creating record while offline to test localStorage

### Problem: Records Disappear After Refresh
**Solution:**
1. Likely localStorage cache issue
2. Check browser storage: DevTools → Application → Local Storage
3. Look for `docuflow.interns.v1` key
4. If key exists, data should persist
5. Clear cache if corrupted: `localStorage.clear()`

### Problem: Slow Data Loading
**Solution:**
1. Network tab might be throttled
2. Check Firestore has indexes
3. Check React Query cache settings
4. Try hard refresh: `Ctrl+Shift+R`

---

## ✅ Full Integration Test Checklist

- [ ] Firebase connection status shows ✅
- [ ] Can create new record
- [ ] Record appears in table
- [ ] Can edit record
- [ ] Can delete record  
- [ ] Offer letter preview shows correctly
- [ ] Can export PDF
- [ ] Console shows no errors
- [ ] Offline mode stores data in localStorage
- [ ] Can login/logout
- [ ] Protected routes redirect properly
- [ ] All timestamps are correct

---

## 📞 When All Tests Pass

✅ Your Firebase integration is **100% working**!

- Data flows correctly: Form → Firebase → Display
- Fallback system works: If Firebase fails → localStorage
- Authentication is secure
- All CRUD operations (Create, Read, Update, Delete) work
- Real-time preview is functional
- Document export works

**Happy coding!** 🚀

