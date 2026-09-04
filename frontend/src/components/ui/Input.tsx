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
            background: 'rgba(255,255,255,0.03)',
            border: error ? '1.5px solid var(--danger, #f87171)' : '1.5px solid var(--border)',
            color: 'var(--text)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium" style={{ color: 'var(--danger, #f87171)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11px]" style={{ color: 'var(--text-secondary, #5f6d7e)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
