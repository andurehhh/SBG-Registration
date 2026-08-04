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
            className="text-xs text-sbg-text-secondary font-mono"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          style={{ minHeight, background: 'var(--card)', ...style }}
          className={[
            'w-full px-3 py-2.5 text-sm resize-y transition-colors duration-150',
            'placeholder:text-sbg-text-muted',
            'focus:outline-none focus:ring-1 focus:ring-sbg-accent/40',
            error
              ? 'border border-red-500 focus:ring-red-500'
              : 'border border-sbg-line',
            className,
          ].join(' ')}
          {...props}
        />
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

Textarea.displayName = 'Textarea'
