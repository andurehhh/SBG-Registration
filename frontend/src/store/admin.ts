import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AdminState {
  isAuthenticated: boolean
  adminId: string | null
  token: string | null

  setAuth: (adminId: string, token: string) => void
  clearAuth: () => void
  logout: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: false,
  adminId: null,
  token: null,

  setAuth: (adminId, token) => set({ isAuthenticated: true, adminId, token }),

  clearAuth: () => set({ isAuthenticated: false, adminId: null, token: null }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ isAuthenticated: false, adminId: null, token: null })
  },
}))
