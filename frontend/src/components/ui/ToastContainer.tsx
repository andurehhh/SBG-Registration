import { useEffect, useRef, useState } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type Toast, type ToastVariant } from '../../store/toast'

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-l-4 border-l-white',
  error: 'border-l-4 border-l-red-600',
  warning: 'border-l-4 border-l-amber-500',
  info: 'border-l-4 border-l-blue-500',
}

const variantIcons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const variantIconColors: Record<ToastVariant, string> = {
  success: 'text-white',
  error: 'text-red-600',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 150)
    }, toast.duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, onDismiss])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 150)
  }

  const Icon = variantIcons[toast.variant]

  const ariaProps =
    toast.variant === 'error'
      ? { 'aria-live': 'assertive' as const, role: 'alert' as const }
      : {}

  return (
    <div
      {...ariaProps}
      className={[
        'flex items-start gap-3 px-4 py-3 bg-sbg-surface',
        'border border-white/[0.06]',
        variantStyles[toast.variant],
        'transition-all duration-150 ease-in-out',
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-4 opacity-0',
      ].join(' ')}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${variantIconColors[toast.variant]}`} />
      <p className="flex-1 text-sm text-white">{toast.message}</p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 hover:bg-white/10 text-sbg-text-muted hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
