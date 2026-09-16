// frontend/src/pages/SubmitCorPage.tsx
import { useState, type FormEvent } from 'react'
import { CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FileUpload } from '../components/ui/FileUpload'
import { edgeFn, ApiError } from '../lib/api'

// Mirror the server-side format check in supabase/functions/submit-cor.
const STUDENT_NUMBER_REGEX = /^\d{4}-\d{5}-BN-\d$/

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; name: string }
  | { status: 'error'; message: string }

export default function SubmitCorPage() {
  const [studentNumber, setStudentNumber] = useState('')
  const [corFile, setCorFile] = useState<File | null>(null)
  const [studentNumberError, setStudentNumberError] = useState<string | null>(null)
  const [corError, setCorError] = useState<string | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStudentNumberError(null)
    setCorError(null)

    // Client-side validation mirrors the submit-cor Edge Function's checks so
    // users get instant feedback before a round-trip.
    let hasError = false
    const trimmed = studentNumber.trim()
    if (!STUDENT_NUMBER_REGEX.test(trimmed)) {
      setStudentNumberError('Student number must be in format 20XX-XXXXX-BN-X.')
      hasError = true
    }
    if (!corFile) {
      setCorError('Please attach your Certificate of Registration.')
      hasError = true
    }
    if (hasError) return

    setSubmitState({ status: 'submitting' })

    try {
      const formData = new FormData()
      formData.append('student_number', trimmed)
      formData.append('cor_file', corFile!)

      const result = await edgeFn.postForm<{ name: string }>('submit-cor', formData)
      const name = result.success ? result.data.name : ''
      setSubmitState({ status: 'success', name })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setSubmitState({ status: 'error', message })
    }
  }

  return (
    <div className="min-h-screen bg-sbg-black flex flex-col">
      <div className="relative z-10 px-6 py-4">
        <BackButton to="/" label="Back to Registration" />
      </div>

      <div className="flex-1 px-4 pb-16">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/sbg-logo-white.svg" alt="SBG Logo" className="h-10 w-10" />
              <div className="text-left">
                <h1 className="font-bold text-sbg-text text-lg leading-tight">
                  Student Builder Group
                </h1>
                <p className="text-sbg-text-muted text-xs">PUP Biñan Campus</p>
              </div>
            </div>
            <h2 className="font-bold text-sbg-text text-3xl mb-3">Submit your COR</h2>
            <p className="text-sbg-text-muted text-sm">
              Registered without a Certificate of Registration? Upload it here to
              complete your application.
            </p>
          </div>

          {submitState.status === 'success' ? (
            <div
              className="flex flex-col items-center gap-3 text-center p-6 rounded-[8px]"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.35)' }}
            >
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--success, #34d399)' }} />
              <h3 className="font-sans text-sbg-text text-lg font-bold">COR submitted</h3>
              <p className="text-sbg-text-muted text-sm">
                Thanks{submitState.name ? `, ${submitState.name}` : ''}! We've received your
                Certificate of Registration. Our team will continue reviewing your application
                and email you once a decision is made.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="student-number"
                  className="text-xs font-semibold font-mono"
                  style={{ color: 'var(--text)' }}
                >
                  Student Number
                </label>
                <Input
                  id="student-number"
                  placeholder="2026-12345-BN-0"
                  value={studentNumber}
                  onChange={(e) => {
                    setStudentNumber(e.target.value)
                    if (studentNumberError) setStudentNumberError(null)
                  }}
                  aria-label="Student number"
                  aria-invalid={!!studentNumberError}
                />
                {studentNumberError && (
                  <div
                    role="alert"
                    className="flex items-center gap-1.5 text-xs font-mono"
                    style={{ color: 'var(--danger)' }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {studentNumberError}
                  </div>
                )}
              </div>

              <FileUpload
                label="Certificate of Registration (COR)"
                required
                value={corFile}
                onChange={(file) => {
                  setCorFile(file)
                  if (file) setCorError(null)
                }}
                error={corError ?? undefined}
                hint="Upload your COR from the PUP student portal. JPEG, PNG, or PDF — max 1 MB."
              />

              {submitState.status === 'error' && (
                <div
                  role="alert"
                  className="p-3 rounded-[8px] bg-red-900/20 border border-red-700/50 text-sm text-red-400 font-mono"
                >
                  {submitState.message}
                </div>
              )}

              <Button
                type="submit"
                loading={submitState.status === 'submitting'}
                icon={<FileText className="w-4 h-4" />}
                className="mt-2"
              >
                Submit COR
              </Button>

              <p className="text-center text-xs text-sbg-text-muted mt-1">
                Trouble uploading? Email your COR to{' '}
                <a href="mailto:sbg.pupbinan@gmail.com" style={{ color: 'var(--accent-bright)' }}>
                  sbg.pupbinan@gmail.com
                </a>{' '}
                with your student number in the subject line.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
