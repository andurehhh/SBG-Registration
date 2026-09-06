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
  ({ label, error, hint, options, placeholder, className = '', id, required, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = selectId ? `${selectId}-error` : undefined
    const hintId = selectId ? `${selectId}-hint` : undefined
    const describedBy = error ? errorId : hint ? hintId : undefined

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {label}
            {required && (
              <span style={{ color: 'var(--danger, #f87171)' }} aria-hidden="true"> *</span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'w-full px-3 py-2.5 rounded-lg text-sm',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-bright)] focus-visible:border-[var(--accent)]',
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
            <option value="" disabled style={{ color: '#6b7a8c', background: '#0d1a2b' }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0d1a2b', color: '#eaf2f9' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium" style={{ color: 'var(--danger, #f87171)' }}>{error}</p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-[11px]" style={{ color: 'var(--text-secondary, #5f6d7e)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
