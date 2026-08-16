import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalBackground } from './components/ui/GlobalBackground'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const IdFinderPage = lazy(() => import('./pages/IdFinderPage'))
const SubmitCorPage = lazy(() => import('./pages/SubmitCorPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

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
        <div className="relative">
          <GlobalBackground />
          <div className="relative z-10">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/id-finder" element={<IdFinderPage />} />
                <Route path="/submit-cor" element={<SubmitCorPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
