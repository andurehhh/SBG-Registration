// frontend/src/components/ui/Select.tsx
import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs text-sbg-text-secondary font-mono"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full px-3 py-2.5 text-sm transition-colors duration-150',
            'focus:outline-none focus:ring-1 focus:ring-sbg-accent/40',
            'appearance-none cursor-pointer',
            error
              ? 'border border-red-500 focus:ring-red-500'
              : 'border border-sbg-line',
            className,
          ].join(' ')}
          style={{ background: 'var(--card)', color: 'var(--text)' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--card)', color: 'var(--text)' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-sbg-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
