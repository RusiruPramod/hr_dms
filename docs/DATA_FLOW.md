# Firebase Data Flow & Backend Integration

## ✅ System Overview

Your app uses a **dual-layer data system**:
- **Primary**: Firebase Firestore (real-time database)
- **Fallback**: Browser localStorage (works offline)

---

## 📊 Complete Data Flow

### 1. FORM SUBMISSION FLOW
```
User fills form → Clicks Save
    ↓
InternForm validates data
    ↓
saveIntern() called with form data
    ↓
    ├─ If Firebase enabled:
    │   └─ saveInternServer() → Firestore `interns` collection
    │
    └─ Fallback to localStorage if Firebase fails
    ↓
localStorage updated (cache)
    ↓
toast.success() → User sees confirmation
    ↓
navigate to /records/{id} → Show saved record
```

### 2. LIST/FETCH FLOW
```
Page mounts → listInterns() called
    ↓
    ├─ If Firebase enabled:
    │   └─ Query Firestore collection('interns')
    │       └─ Sort by updatedAt (newest first)
    │
    └─ Read from localStorage if Firebase fails
    ↓
Result cached in localStorage
    ↓
React Query manages state
    ↓
UI updates with data
```

### 3. SIGNATURE UPLOAD FLOW
```
User signs document → Capture signature canvas
    ↓
uploadSignatureServer(internId, type, base64)
    ↓
Convert base64 → PNG buffer
    ↓
Upload to Firebase Storage:
  signatures/{internId}/{type}-{timestamp}.png
    ↓
Get download URL
    ↓
Update Firestore document:
  metadata.signatures[type] = downloadUrl
    ↓
Return URL for embedding in documents
```

### 4. DOCUMENT GENERATION FLOW
```
User clicks "Export PDF" / "Export NDA"
    ↓
OfferLetterDocument / NDADocument renders
    ↓
exportElementToPdf() creates PDF from DOM
    ↓
Optional: uploadDocumentServer() to Firebase Storage
    ↓
Browser downloads PDF locally
```

---

## 🔧 Backend Functions (src/lib/api/interns.functions.ts)

| Function | Purpose | Firebase Operation |
|----------|---------|-------------------|
| `listInternsServer()` | Get all interns | Query `interns` collection, sort by updatedAt |
| `getInternServer(id)` | Get single intern | Get doc by ID |
| `saveInternServer(data, id?)` | Create or update | setDoc with merge:true |
| `deleteInternServer(id)` | Delete intern + files | deleteDoc + cleanup storage files |
| `uploadSignatureServer()` | Save signature image | Upload to Storage, update metadata |
| `uploadDocumentServer()` | Save generated PDF | Upload to Storage, track in documents array |

---

## 🔐 Error Handling Strategy

### What happens if Firebase fails?

1. **SaveIntern fails**:
   ```typescript
   try {
     await saveInternServer(data)
   } catch (err) {
     console.warn("Firebase failed, using localStorage")
     // Falls back to saveIntern() → localStorage
   }
   ```

2. **ListInterns fails**:
   ```typescript
   try {
     return await listInternsServer()
   } catch (err) {
     console.warn("Firebase failed, reading from cache")
     return readLocal() // localStorage fallback
   }
   ```

3. **User sees error toast** only if BOTH fail

---

## 📋 Validation & Logging

### Form Validation (intern-form.tsx)
- Full Name: Required, non-empty
- NIC: 12 digits OR 9 digits + V/X
- Dates: Start < End
- Phone: 10-15 digits (if provided)
- Department: Required

### Logging Points
```typescript
// Console logs on:
- Firebase initialization ✅
- Firestore query success/failure ✅
- Data save/update/delete attempts ✅
- Signature upload progress ✅
- Cache read/write ✅
```

---

## ✨ Real-Time Features

| Feature | Implementation | Firebase |
|---------|-----------------|----------|
| Form auto-complete | Filtered from local data | Reads existing records |
| Signature preview | Canvas element | None (client-side) |
| Offer letter preview | Real-time render | Updates when data changes |
| Delete with cleanup | Firestore + Storage | Removes files after doc delete |

---

## 🚀 How to Test

### 1. Check Firebase Connection:
```javascript
// Open browser DevTools → Console
import { checkFirebaseStatus } from '@/lib/firebase-status'
checkFirebaseStatus()
```

### 2. Create a Test Record:
- Go to `/records/new`
- Fill form with test data
- Click "Save"
- Check browser console for logs
- Should appear in table immediately

### 3. Monitor Data Flow:
- Open DevTools → Network tab
- Look for `interns` collection queries
- Check timestamps on success

### 4. Test Offline Mode:
- Go to Network tab → Offline
- Try creating a record
- Should save to localStorage
- Go back online → data syncs to Firebase

---

## 🔍 Firebase Firestore Structure

```
Database: hr-document-management-abfaa
└── Collection: interns
    └── Document: {internId}
        ├── fullName: string
        ├── nic: string
        ├── department: string
        ├── startDate: string (YYYY-MM-DD)
        ├── endDate: string (YYYY-MM-DD)
        ├── supervisor: string
        ├── phone: string
        ├── address: string
        ├── createdAt: number (timestamp)
        ├── updatedAt: number (timestamp)
        └── metadata: object
            ├── signatures: { intern, witness, hr }
            └── documents: [ { type, url, timestamp } ]
```

---

## 📱 Data Sync Architecture

```
App State (React Query)
    ↓
    ├─ useQuery('interns') → calls listInterns()
    └─ Polls every 5min (configurable)
        ↓
        ├─ Firebase Firestore (if enabled)
        └─ localStorage cache (fallback)
            ↓
            Updates component state
            ↓
            UI re-renders
```

---

## ⚠️ Known Limitations

1. **Offline updates not synced** - If user saves offline, sync happens on reconnect
2. **No real-time subscriptions** - Uses polling via React Query instead
3. **Local conflict resolution** - Latest write wins (timestamp comparison)

---

## 🛠️ Configuration Files

- `.env` - Firebase credentials (API key, project ID, etc.)
- `src/lib/firebase.ts` - Firebase initialization
- `src/lib/interns.ts` - Data layer API
- `src/lib/api/interns.functions.ts` - Firestore operations
- `src/components/intern-form.tsx` - Form validation & submission

