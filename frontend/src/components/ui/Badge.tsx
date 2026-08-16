// frontend/src/components/ui/Badge.tsx
import type { ReactNode } from 'react'

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'inactive' | 'removed' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-white/10 text-white border-white/20',
  approved: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
  rejected: 'bg-red-900/50 text-red-400 border-red-700/50',
  inactive: 'bg-white/5 text-sbg-text-muted border-white/10',
  removed: 'bg-white/5 text-sbg-text-muted border-white/10 line-through',
  default: 'bg-white/[0.03] text-sbg-text-muted border-white/[0.06]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-[4px]',
        'text-xs border font-mono',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
