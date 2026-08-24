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
            className="text-xs font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full px-3 py-2.5 rounded-lg text-sm',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#2d9cdb]/25 focus:border-[#2d9cdb]',
            'appearance-none cursor-pointer',
            className,
          ].join(' ')}
          style={{
            background: '#ffffff',
            border: error ? '1.5px solid #e53e3e' : '1.5px solid #d1d9e0',
            color: 'var(--text, #1a2332)',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled style={{ color: '#9ca3af' }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select'
