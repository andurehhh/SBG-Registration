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
            className="text-xs font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3 py-2.5 rounded-lg text-sm',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#2d9cdb]/25 focus:border-[#2d9cdb]',
            className,
          ].join(' ')}
          style={{
            background: '#ffffff',
            border: error ? '1.5px solid #e53e3e' : '1.5px solid #d1d9e0',
            color: 'var(--text, #1a2332)',
            // Placeholder styled via CSS below
          }}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium" style={{ color: '#e53e3e' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11px]" style={{ color: 'var(--text-secondary, #5f6d7e)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
