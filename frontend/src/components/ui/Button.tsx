// frontend/src/components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  children?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      children,
      className = '',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: { background: 'var(--accent)', color: '#ffffff', border: '1.5px solid var(--accent-dark)' },
      outline: { background: 'transparent', color: 'var(--accent-bright)', border: '1.5px solid var(--accent)' },
      ghost: { background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)' },
      danger: { background: 'var(--danger)', color: '#ffffff', border: '1.5px solid #c53030' },
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2 font-sans font-semibold',
          'rounded-lg transition-all duration-150 min-h-[44px]',
          'hover:brightness-110 hover:-translate-y-[1px]',
          'active:translate-y-0 active:brightness-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          sizeClasses[size],
          className,
        ].join(' ')}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'
