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
            background: 'rgba(255,255,255,0.03)',
            border: error ? '1.5px solid var(--danger, #f87171)' : '1.5px solid var(--border)',
            color: 'var(--text)',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled style={{ color: '#5b6675', background: '#0e131c' }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0e131c', color: '#eef2f7' }}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select'
