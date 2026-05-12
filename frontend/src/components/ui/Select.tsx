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
            className="text-sm font-mono text-sbg-text-muted"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full px-3 py-2 rounded-[8px] text-sm text-white',
            'bg-sbg-navy-light border transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0',
            'appearance-none cursor-pointer',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/10 focus:border-sbg-purple',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-sbg-navy-light">
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
