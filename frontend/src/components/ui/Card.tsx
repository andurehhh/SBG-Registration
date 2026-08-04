// frontend/src/components/ui/Card.tsx
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        paddingClasses[padding],
        className,
      ].join(' ')}
      style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
      {...props}
    >
      {children}
    </div>
  )
}
