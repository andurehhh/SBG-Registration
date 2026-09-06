// frontend/src/components/ui/Textarea.tsx
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  minHeight?: string
  /** id of an external element (e.g. a character counter) to associate for screen readers */
  describedById?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, minHeight = '120px', className = '', id, style, required, describedById, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = textareaId ? `${textareaId}-error` : undefined
    const hintId = textareaId ? `${textareaId}-hint` : undefined
    const describedBy = [error ? errorId : hint ? hintId : undefined, describedById]
      .filter(Boolean)
      .join(' ') || undefined

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {label}
            {required && (
              <span style={{ color: 'var(--danger, #f87171)' }} aria-hidden="true"> *</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          style={{
            minHeight,
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text)',
            border: error ? '1.5px solid var(--danger, #f87171)' : '1.5px solid var(--border)',
            ...style,
          }}
          className={[
            'w-full px-3 py-2.5 text-sm resize-y rounded-lg transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#2d9cdb]/25 focus:border-[#2d9cdb]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium" style={{ color: 'var(--danger, #f87171)' }}>{error}</p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-sbg-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
