# 🔀 Code Conversion Reference Guide

Quick side-by-side comparisons for converting your code from TanStack to React Router.

---

## 1️⃣ Route Component Structure

### BEFORE (TanStack Start)
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useNavigate, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/records')({
  head: () => ({
    meta: [{ title: 'Records — DocuFlow HR' }]
  }),
  beforeLoad: async () => {
    const user = getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: RecordsPage,
})

function RecordsPage() {
  const navigate = useNavigate()
  return (
    <div>
      <h1>Records</h1>
      <button onClick={() => navigate({ to: '/records/new' })}>
        New
      </button>
    </div>
  )
}
```

### AFTER (React Router)
```typescript
import { useNavigate, Link } from 'react-router-dom'

export default function RecordsPage() {
  const navigate = useNavigate()
  return (
    <div>
      <h1>Records</h1>
      <button onClick={() => navigate('/records/new')}>
        New
      </button>
    </div>
  )
}

// In App.tsx:
// <Route
//   path="/records"
//   element={<ProtectedRoute><Records /></ProtectedRoute>}
// />
```

**Key Changes:**
- ❌ Remove `createFileRoute()`
- ❌ Remove `beforeLoad` (moved to App.tsx)
- ✅ Export as default function
- ✅ Use `navigate('/path')` instead of `navigate({ to: '/path' })`
- ✅ Protection handled by `<ProtectedRoute>` wrapper

---

## 2️⃣ Navigation with Parameters

### BEFORE
```typescript
// Link with params
<Link to="/records/$id" params={{ id: r.id }}>
  Edit
</Link>

// Navigate with params
navigate({ to: '/records/$id', params: { id } })
```

### AFTER
```typescript
// Link with template literal
<Link to={`/records/${r.id}`}>
  Edit
</Link>

// Navigate with template literal
navigate(`/records/${id}`)
```

**Key Changes:**
- ❌ No `params:` object
- ✅ Use template literals for URL building
- ✅ Cleaner, more standard React

---

## 3️⃣ Reading URL Parameters

### BEFORE
```typescript
function RecordDetail() {
  const { id } = Route.useParams()
  
  return <div>Record: {id}</div>
}
```

### AFTER
```typescript
import { useParams } from 'react-router-dom'

function RecordDetail() {
  const { id } = useParams<{ id: string }>()
  
  return <div>Record: {id}</div>
}
```

**Key Changes:**
- ❌ `Route.useParams()` → ✅ `useParams()` from 'react-router-dom'
- ✅ API is the same, just different import

---

## 4️⃣ Query Parameters (Search)

### BEFORE
```typescript
const search = z.object({ id: z.string().optional() })

export const Route = createFileRoute('/nda')({
  validateSearch: (s) => search.parse(s),
  component: NdaPage,
})

function NdaPage() {
  const { id } = Route.useSearch()
  const navigate = Route.useNavigate()
  
  const onSelect = (val) => {
    navigate({ search: { id: val }, replace: true })
  }
}
```

### AFTER
```typescript
import { useSearchParams } from 'react-router-dom'

function NdaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const id = searchParams.get('id')
  
  const onSelect = (val) => {
    setSearchParams({ id: val })
  }
}
```

**Key Changes:**
- ❌ `Route.useSearch()` → ✅ `useSearchParams()`
- ❌ Zod schema validation → ✅ Manual `.get()` calls
- ✅ More standard URLSearchParams API

---

## 5️⃣ Protected Routes

### BEFORE
```typescript
export const Route = createFileRoute('/records')({
  beforeLoad: async () => {
    const user = getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: Records,
})
```

### AFTER (App.tsx)
```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading])
  
  if (loading) return <div>Loading...</div>
  if (!user) return null
  
  return children
}

// In router:
<Route
  path="/records"
  element={<ProtectedRoute><Records /></ProtectedRoute>}
/>
```

**Key Changes:**
- ❌ `beforeLoad` server-side check → ✅ Client-side `useEffect` + guard
- ✅ Shows loading state
- ✅ Flexible, can wrap multiple routes

---

## 6️⃣ Redirects

### BEFORE
```typescript
import { redirect } from '@tanstack/react-router'

beforeLoad: async () => {
  if (user) {
    throw redirect({ to: '/records' })
  }
}
```

### AFTER
```typescript
import { Navigate } from 'react-router-dom'

function LoginPage() {
  const { user } = useAuth()
  
  if (user) {
    return <Navigate to="/records" replace />
  }
  
  return <LoginForm />
}

// Or in root route:
<Route path="/" element={<Navigate to="/records" replace />} />
```

**Key Changes:**
- ❌ `throw redirect()` → ✅ Return `<Navigate>` component
- ✅ More React-like

---

## 7️⃣ Server Functions (No Longer Used!)

### BEFORE
```typescript
// In API file
import { server$ } from '@tanstack/react-start'

export const uploadDocument = server$(async (data) => {
  // Server-side code
  return result
})

// In component
import { useServerFn } from '@tanstack/react-start'

function Component() {
  const upload = useServerFn(uploadDocument)
  
  const handleSubmit = async () => {
    await upload({ file })
  }
}
```

### AFTER
```typescript
// Call Firebase directly from client
import { storage } from '@/lib/firebase'
import { ref, uploadBytes } from 'firebase/storage'

function Component() {
  const handleSubmit = async () => {
    const fileRef = ref(storage, `documents/${file.name}`)
    await uploadBytes(fileRef, file)
  }
}

// Or if you need backend logic, use:
// - Firebase Cloud Functions
// - Firebase Firestore Rules
// - External API endpoint
```

**Key Changes:**
- ❌ `server$()` - not needed
- ❌ `useServerFn()` - not needed
- ✅ Use Firebase client SDK directly
- ✅ No server-side functions in this architecture

---

## 8️⃣ Layout Components

### BEFORE (TanStack Root)
```typescript
import { Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  )
}
```

### AFTER (React Router)
```typescript
import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div>
      <Sidebar />
      <Outlet />
    </div>
  )
}

// In App.tsx:
<BrowserRouter>
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/records" element={<Records />} />
      <Route path="/records/:id" element={<RecordDetails />} />
    </Route>
  </Routes>
</BrowserRouter>
```

**Key Changes:**
- ❌ `createRootRouteWithContext` → ✅ Standard layout component
- ✅ Nested routes with shared layout
- ✅ Simpler, more familiar pattern

---

## 9️⃣ Error Boundaries

### BEFORE
```typescript
function ErrorComponent({ error, reset }) {
  return (
    <div>
      <h1>Error</h1>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

export const Route = createRootRoute({
  errorComponent: ErrorComponent,
})
```

### AFTER
```typescript
import { useRouteError } from 'react-router-dom'

function ErrorBoundary() {
  const error = useRouteError()
  
  return (
    <div>
      <h1>Error</h1>
      <button onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  )
}

// In App.tsx:
<ErrorBoundary>
  <Routes>
    {/* routes */}
  </Routes>
</ErrorBoundary>
```

**Key Changes:**
- ❌ `errorComponent` prop → ✅ React Error Boundary pattern
- ✅ Use React's standard error handling

---

## 🔟 Getting Router Context

### BEFORE
```typescript
// In root:
export const Route = createRootRouteWithContext<RouterContext>()({...})

// In components:
const { queryClient } = Route.useRouterContext()
```

### AFTER
```typescript
// In App.tsx - create QueryClient at top level
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* routes */}
      </Router>
    </QueryClientProvider>
  )
}

// In components:
// Use hooks directly, no context needed
const { data } = useQuery({ queryKey: [...] })
```

**Key Changes:**
- ❌ Router context → ✅ Provider pattern at app root
- ✅ Standard React way to share state

---

## Quick Reference Table

| Feature | TanStack | React Router | Migration |
|---------|----------|--------------|-----------|
| **Routes** | `createFileRoute()` | Export component | Remove wrapper, export default |
| **Navigate** | `navigate({ to })` | `navigate()` | Remove braces, use template literal |
| **Params** | `Route.useParams()` | `useParams()` | Same API, different import |
| **Search** | `Route.useSearch()` | `useSearchParams()` | Different API, need to adapt |
| **Redirect** | `throw redirect()` | `<Navigate>` | Return component instead |
| **Protected** | `beforeLoad` check | `useEffect` + guard | Move to component level |
| **Server fn** | `server$()` | Firebase calls | Use client SDK directly |
| **Layout** | Root route | Nested routes | Simpler layout pattern |
| **Metadata** | `head()` option | `<Helmet>` or `useEffect` | Use react-helmet-async |

---

## Common Conversion Patterns

### Pattern 1: Simple Route
```typescript
// OLD
export const Route = createFileRoute('/about')({
  component: AboutPage,
})

// NEW
export default function AboutPage() { ... }

// In App.tsx:
<Route path="/about" element={<AboutPage />} />
```

### Pattern 2: Dynamic Route
```typescript
// OLD
export const Route = createFileRoute('/user/$id')({
  component: UserDetail,
})

// NEW
export default function UserDetail() {
  const { id } = useParams()
  ...
}

// In App.tsx:
<Route path="/user/:id" element={<UserDetail />} />
```

### Pattern 3: Query Parameters
```typescript
// OLD
navigate({ search: { tab: 'details' } })

// NEW
setSearchParams({ tab: 'details' })
```

### Pattern 4: Nested Routes
```typescript
// OLD - Not straightforward with TanStack

// NEW
<Route element={<Layout />}>
  <Route path="/records" element={<Records />} />
  <Route path="/records/:id" element={<Detail />} />
</Route>
```

---

## 💡 Pro Tips

1. **Type-safe params**: Use TypeScript for `useParams<{ id: string }>()`
2. **Memoize navigation**: Wrap frequently-used navigation in useCallback
3. **Lazy load routes**: Use `lazy()` + `Suspense` for code splitting
4. **Test routes**: React Router docs have excellent testing examples
5. **Use SearchParams for UI state**: Like sidebar filters, sort order, etc.

---

## 🆘 Stuck?

If you hit issues:

1. **Check React Router docs**: https://reactrouter.com
2. **Look at converted files** in `src/routes/` for examples
3. **Search in codebase** for similar patterns
4. **Compare side-by-side** with BEFORE/AFTER examples above
5. **Ask for help** with specific error message

---

**You've got this! Every conversion follows one of the patterns above. 💪**
