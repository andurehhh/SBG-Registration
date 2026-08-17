// frontend/src/components/ui/Input.tsx
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs text-sbg-text-secondary font-mono"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3 py-2.5 rounded text-sm',
            'transition-colors duration-150',
            'placeholder:text-sbg-text-muted',
            'focus:outline-none focus:ring-1 focus:ring-sbg-accent/40 focus:border-sbg-accent/40',
            error
              ? 'border-red-500 focus:ring-red-500'
              : '',
            className,
          ].join(' ')}
          style={{
            background: 'var(--card)',
            border: error ? undefined : '1px solid var(--line)',
            color: 'var(--text)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-sbg-text-muted break-all">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
