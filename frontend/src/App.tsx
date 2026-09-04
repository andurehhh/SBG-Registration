import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/ToastContainer'

const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const IdFinderPage = lazy(() => import('./pages/IdFinderPage'))
const SubmitCorPage = lazy(() => import('./pages/SubmitCorPage'))

const AdminLoginPage = __ADMIN_ENABLED__
  ? lazy(() => import('./pages/AdminLoginPage'))
  : null
const AdminPage = __ADMIN_ENABLED__
  ? lazy(() => import('./pages/AdminPage'))
  : null

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--accent)' }}>$</span> loading...
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Registration is the app root — the public marketing site lives on a separate domain */}
            <Route path="/" element={<RegisterPage />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/id-finder" element={<IdFinderPage />} />
            <Route path="/submit-cor" element={<SubmitCorPage />} />

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
