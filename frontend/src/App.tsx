import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/ToastContainer'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const IdFinderPage = lazy(() => import('./pages/IdFinderPage'))

// Admin routes are only imported when the build flag is enabled
// This means production builds for students won't include admin code at all
const AdminLoginPage = __ADMIN_ENABLED__
  ? lazy(() => import('./pages/AdminLoginPage'))
  : null
const AdminPage = __ADMIN_ENABLED__
  ? lazy(() => import('./pages/AdminPage'))
  : null

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-sbg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/id-finder" element={<IdFinderPage />} />

            {/* Admin routes: gated by build flag + obscured path */}
            {__ADMIN_ENABLED__ && AdminLoginPage && (
              <Route path={`/${__ADMIN_PATH__}/login`} element={<AdminLoginPage />} />
            )}
            {__ADMIN_ENABLED__ && AdminPage && (
              <Route path={`/${__ADMIN_PATH__}/*`} element={<AdminPage />} />
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App
