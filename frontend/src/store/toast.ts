import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration: number // ms
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant, duration?: number) => string
  dismissToast: (id: string) => void
  clearAll: () => void
}

const MAX_TOASTS = 5

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, variant, duration = 5000) => {
    if (!message || message.trim().length === 0) {
      return ''
    }

    const id = crypto.randomUUID()
    const toast: Toast = {
      id,
      message,
      variant,
      duration,
      createdAt: Date.now(),
    }

    set((state) => {
      const updated = [...state.toasts, toast]
      // Enforce max 5 toasts — evict oldest if over limit
      if (updated.length > MAX_TOASTS) {
        return { toasts: updated.slice(updated.length - MAX_TOASTS) }
      }
      return { toasts: updated }
    })

    return id
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearAll: () => set({ toasts: [] }),
}))
