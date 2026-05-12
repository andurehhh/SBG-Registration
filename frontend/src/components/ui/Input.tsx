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
            className="text-sm font-mono text-sbg-text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3 py-2 rounded-[8px] text-sm text-white',
            'bg-sbg-navy-light border transition-colors duration-150',
            'placeholder:text-sbg-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/10 focus:border-sbg-purple',
            className,
          ].join(' ')}
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
