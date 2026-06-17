import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useAuth } from '@/hooks/use-auth'

// Pages
import Login from './routes/login'
import Home from './routes/Home'
import Records from './routes/Records'
import RecordDetails from './routes/RecordDetails'
import RecordNew from './routes/RecordNew'
import NDA from './routes/nda'
import OfferLetter from './routes/OfferLetter'
import DocsPage from './routes/docs'
import NotFound from './routes/404'

const queryClient = new QueryClient()

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Records />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records/:id"
            element={
              <ProtectedRoute>
                <RecordDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records/new"
            element={
              <ProtectedRoute>
                <RecordNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/docs"
            element={
              <ProtectedRoute>
                <DocsPage />
              </ProtectedRoute>
            }
          />

          {/* Public Document Routes */}
          <Route
            path="/nda"
            element={
              <ProtectedRoute>
                <NDA />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offer-letter"
            element={
              <ProtectedRoute>
                <OfferLetter />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
