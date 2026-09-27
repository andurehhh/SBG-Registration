// frontend/src/components/admin/AdminLayout.tsx
import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'
import { useAdminStore } from '../../store/admin'
import { supabase } from '../../lib/supabase'

export function AdminLayout() {
  const { isAuthenticated, setAuth, clearAuth } = useAdminStore()
  const [isChecking, setIsChecking] = useState(!isAuthenticated)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setIsChecking(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuth(data.session.user.id, data.session.access_token)
      } else {
        clearAuth()
      }
      setIsChecking(false)
    })
  }, [isAuthenticated, setAuth, clearAuth])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-sbg-black flex items-center justify-center">
        <div className="font-mono text-xs text-sbg-text-muted">
          <span className="text-sbg-accent">$</span> loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${__ADMIN_PATH__}/login`} replace />
  }

  return (
    <div className="admin-shell">
      <AdminSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <main className="admin-main">
        <div className="admin-mobile-bar">
          <button type="button" className="admin-menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div><strong>SBG Admin</strong><span>PUP Biñan</span></div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
