// frontend/src/store/admin.ts
import { create } from 'zustand'

interface AdminState {
  isAuthenticated: boolean
  adminId: string | null

  // Actions
  setAuth: (adminId: string) => void
  clearAuth: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: false,
  adminId: null,

  setAuth: (adminId) => set({ isAuthenticated: true, adminId }),

  clearAuth: () => set({ isAuthenticated: false, adminId: null }),
}))
