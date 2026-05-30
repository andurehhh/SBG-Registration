// frontend/src/components/admin/AdminLayout.tsx
import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { useAdminStore } from '../../store/admin'
import { supabase } from '../../lib/supabase'

export function AdminLayout() {
  const { isAuthenticated, setAuth, clearAuth } = useAdminStore()
  const [isChecking, setIsChecking] = useState(!isAuthenticated)

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
        <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="flex h-screen bg-sbg-black overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-sbg-navy-light">
        <Outlet />
      </main>
    </div>
  )
}
