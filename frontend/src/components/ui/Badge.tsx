// frontend/src/components/ui/Badge.tsx
import type { ReactNode } from 'react'

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'inactive' | 'removed' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-sbg-purple-muted text-sbg-purple-light border-sbg-purple/30',
  approved: 'bg-green-900/50 text-green-400 border-green-700/50',
  rejected: 'bg-red-900/50 text-red-400 border-red-700/50',
  inactive: 'bg-gray-800/50 text-gray-400 border-gray-700/50',
  removed: 'bg-gray-900/50 text-gray-500 border-gray-800/50 line-through',
  default: 'bg-sbg-navy-light text-sbg-text-muted border-white/10',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-[4px]',
        'text-xs font-mono border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
