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
        className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-sbg-navy border border-white/[0.08] text-sbg-text-muted hover:text-white hover:border-sbg-purple/50 hover:bg-sbg-navy-light transition-all duration-150"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {/* Tooltip */}
      <span className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap bg-sbg-navy-light border border-white/[0.08] text-white text-xs font-sans px-2.5 py-1 rounded-[6px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
        {label}
      </span>
    </div>
  )
}
