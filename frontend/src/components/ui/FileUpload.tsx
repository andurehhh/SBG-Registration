// frontend/src/components/ui/FileUpload.tsx
import { useRef, useState, useId, type DragEvent, type ChangeEvent, type KeyboardEvent } from 'react'
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB

interface FileUploadProps {
  label?: string
  accept?: string
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
  hint?: string
  required?: boolean
  /** When true, shows an explicit "Optional" badge (used only when not required). */
  optional?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Invalid file type. Only JPEG, PNG, and PDF are allowed.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large. Maximum size is 1 MB (current: ${formatFileSize(file.size)}).`
  }
  return null
}

/** Returns true iff the file passes all upload validation rules. */
export function isFileValid(file: File): boolean {
  return validateFile(file) === null
}

export function FileUpload({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  optional,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const reactId = useId()
  const inputId = `file-${reactId}`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const displayError = error ?? validationError
  const describedBy = displayError ? errorId : hint ? hintId : undefined

  function handleFile(file: File) {
    const err = validateFile(file)
    if (err) {
      setValidationError(err)
      onChange(null)
    } else {
      setValidationError(null)
      onChange(file)
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  function handleRemove() {
    onChange(null)
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="flex items-center gap-2 flex-wrap text-xs font-semibold font-mono" style={{ color: 'var(--text)' }}>
          <span>{label}</span>
          {required ? (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent-bright)', border: '1px solid rgba(79,143,247,0.35)' }}
            >
              REQUIRED
            </span>
          ) : optional ? (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
              style={{ background: 'rgba(159,176,195,0.12)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              OPTIONAL
            </span>
          ) : null}
        </label>
      )}

      {value ? (
        // File selected / success state
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.35)' }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--success, #34d399)' }} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-mono" style={{ color: 'var(--text)' }}>{value.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {formatFileSize(value.size)} · Ready to submit
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={`Remove file ${value.name}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          role="button"
          tabIndex={0}
          aria-label={label ? `${label}. Upload a file. Accepted formats JPEG, PNG or PDF, maximum 1 megabyte.` : 'Upload a file'}
          aria-describedby={describedBy}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed rounded-lg cursor-pointer transition-colors duration-150"
          style={{
            borderColor: isDragging ? 'var(--accent)' : displayError ? 'var(--danger)' : 'var(--border)',
            background: isDragging ? 'var(--accent-dim)' : displayError ? 'rgba(248,113,113,0.05)' : 'transparent',
          }}
        >
          <Upload className="w-6 h-6" style={{ color: isDragging ? 'var(--accent-bright)' : 'var(--text-secondary)' }} aria-hidden="true" />
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Drop file here or{' '}
              <span className="underline" style={{ color: 'var(--accent-bright)' }}>browse</span>
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              JPEG, PNG, or PDF — max 1 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />

      {displayError && (
        <div id={errorId} role="alert" className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--danger)' }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {displayError}
        </div>
      )}
      {hint && !displayError && (
        <p id={hintId} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hint}</p>
      )}
    </div>
  )
}
