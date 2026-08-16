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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sbg-accent hover:brightness-110 text-[#0c0f10] border-transparent',
  outline: 'bg-transparent hover:opacity-70 text-sbg-text border-sbg-text/30 hover:border-sbg-text/60',
  ghost: 'bg-transparent hover:opacity-70 text-sbg-text border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
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
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center gap-2 font-sans font-medium',
          'rounded border transition-colors duration-150',
          'focus:outline-none focus:ring-1 focus:ring-sbg-accent/40 focus:ring-offset-0 focus:ring-offset-sbg-black',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
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
