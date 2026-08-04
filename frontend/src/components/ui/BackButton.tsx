// frontend/src/components/ui/BackButton.tsx
// A large back button that shows a tooltip on hover
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}

export function BackButton({ to = '/', label = 'Back to Home', className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <div className={`relative group inline-block ${className}`}>
      <button
        onClick={() => navigate(to)}
        aria-label={label}
        className="flex items-center justify-center w-10 h-10 bg-white/[0.03] border border-white/[0.06] text-sbg-text-muted hover:text-sbg-text hover:border-white/20 transition-all duration-150"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {/* Tooltip */}
      <span className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-sbg-surface border border-white/[0.06] text-sbg-text text-xs px-2.5 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
        {label}
      </span>
    </div>
  )
}
