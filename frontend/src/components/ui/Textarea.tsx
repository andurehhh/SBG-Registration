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
            className="text-sm font-mono text-sbg-text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          style={{ minHeight, ...style }}
          className={[
            'w-full px-3 py-2 rounded-[8px] text-sm text-white',
            'bg-sbg-navy-light border transition-colors duration-150',
            'placeholder:text-sbg-text-muted resize-y',
            'focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/10 focus:border-sbg-purple',
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
