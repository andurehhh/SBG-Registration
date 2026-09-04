// frontend/src/components/ui/Textarea.tsx
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  minHeight?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, minHeight = '120px', className = '', id, style, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
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
          <p className="text-xs font-medium" style={{ color: 'var(--danger, #f87171)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-sbg-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
