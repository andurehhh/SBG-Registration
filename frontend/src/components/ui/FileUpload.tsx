// frontend/src/components/ui/FileUpload.tsx
import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB

interface FileUploadProps {
  label?: string
  accept?: string
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
  hint?: string
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
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const displayError = error ?? validationError

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

  function handleRemove() {
    onChange(null)
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs text-sbg-text-muted font-mono">{label}</label>
      )}

      {value ? (
        // File selected state
        <div className="flex items-center gap-3 p-3" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <File className="w-5 h-5 shrink-0" style={{ color: 'var(--muted)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-mono" style={{ color: 'var(--text)' }}>{value.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatFileSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 transition-colors"
            style={{ color: 'var(--muted)' }}
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed cursor-pointer transition-colors duration-150"
          style={{
            borderColor: isDragging ? 'var(--text)' : displayError ? '#ef4444' : 'var(--line)',
            background: isDragging ? 'var(--card)' : displayError ? 'rgba(239,68,68,0.05)' : 'transparent',
          }}
        >
          <Upload className="w-6 h-6" style={{ color: 'var(--muted)' }} />
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Drop file here or{' '}
              <span className="underline" style={{ color: 'var(--text)' }}>browse</span>
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              JPEG, PNG, or PDF — max 1 MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />

      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {displayError}
        </div>
      )}
      {hint && !displayError && (
        <p className="text-xs text-sbg-text-muted">{hint}</p>
      )}
    </div>
  )
}
