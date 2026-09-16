// frontend/src/pages/SubmitCorPage.tsx
import { useState, type FormEvent } from 'react'
import { Search, CheckCircle2, AlertCircle, UserX, FileText } from 'lucide-react'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FileUpload } from '../components/ui/FileUpload'
import { edgeFn, ApiError } from '../lib/api'

// Mirror the server-side format check in supabase/functions/submit-cor.
const STUDENT_NUMBER_REGEX = /^\d{4}-\d{5}-BN-\d$/

// The page has two steps. First the applicant searches by student number; the
// submit-cor Edge Function verifies (server-side, since pending applicants are
// hidden from the public view by RLS) that a pending application awaiting a COR
// exists. Only then do we reveal the upload step.
type SearchState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'found'; name: string }
  | { status: 'not_found'; message: string }

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; name: string }
  | { status: 'error'; message: string }

export default function SubmitCorPage() {
  const [studentNumber, setStudentNumber] = useState('')
  const [studentNumberError, setStudentNumberError] = useState<string | null>(null)
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' })

  const [corFile, setCorFile] = useState<File | null>(null)
  const [corError, setCorError] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })

  // Step 1 — search by student number.
  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setStudentNumberError(null)

    const trimmed = studentNumber.trim()
    if (!STUDENT_NUMBER_REGEX.test(trimmed)) {
      setStudentNumberError('Student number must be in format 20XX-XXXXX-BN-X.')
      return
    }

    setSearchState({ status: 'searching' })

    try {
      // Check-only call: student number, no file. The function returns the
      // applicant name when a pending application awaiting a COR exists.
      const formData = new FormData()
      formData.append('student_number', trimmed)

      const result = await edgeFn.postForm<{ name: string; canUpload: boolean }>('submit-cor', formData)
      const name = result.success ? result.data.name : ''
      setSearchState({ status: 'found', name })
    } catch (err) {
      // The function returns clear messages: no application found, already
      // processed, or COR already submitted. Show whichever applies.
      const message =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setSearchState({ status: 'not_found', message })
    }
  }

  // Step 2 — upload the COR for the found applicant.
  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    setCorError(null)

    if (!corFile) {
      setCorError('Please attach your Certificate of Registration.')
      return
    }

    setUploadState({ status: 'uploading' })

    try {
      const formData = new FormData()
      formData.append('student_number', studentNumber.trim())
      formData.append('cor_file', corFile)

      const result = await edgeFn.postForm<{ name: string }>('submit-cor', formData)
      const name = result.success ? result.data.name : ''
      setUploadState({ status: 'success', name })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setUploadState({ status: 'error', message })
    }
  }

  // Let the applicant search again (e.g. mistyped number).
  function resetSearch() {
    setSearchState({ status: 'idle' })
    setCorFile(null)
    setCorError(null)
    setUploadState({ status: 'idle' })
  }

  const showUpload = searchState.status === 'found'

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
              Enter your student number to find your application, then upload your
              Certificate of Registration.
            </p>
          </div>

          {uploadState.status === 'success' ? (
            // Final success state.
            <div
              className="flex flex-col items-center gap-3 text-center p-6 rounded-[8px]"
              style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.35)' }}
            >
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--success, #34d399)' }} />
              <h3 className="font-sans text-sbg-text text-lg font-bold">COR submitted</h3>
              <p className="text-sbg-text-muted text-sm">
                Thanks{uploadState.name ? `, ${uploadState.name}` : ''}! We've received your
                Certificate of Registration. Our team will continue reviewing your application
                and email you once a decision is made.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1 — search */}
              <form onSubmit={handleSearch} className="flex flex-col gap-2">
                <label
                  htmlFor="student-number"
                  className="text-xs font-semibold font-mono"
                  style={{ color: 'var(--text)' }}
                >
                  Student Number
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="student-number"
                      placeholder="2026-12345-BN-0"
                      value={studentNumber}
                      onChange={(e) => {
                        setStudentNumber(e.target.value)
                        if (studentNumberError) setStudentNumberError(null)
                        // Editing the number invalidates a previous search.
                        if (searchState.status !== 'idle') resetSearch()
                      }}
                      aria-label="Student number"
                      aria-invalid={!!studentNumberError}
                      disabled={showUpload}
                    />
                  </div>
                  {!showUpload && (
                    <Button
                      type="submit"
                      loading={searchState.status === 'searching'}
                      icon={<Search className="w-4 h-4" />}
                    >
                      Search
                    </Button>
                  )}
                </div>
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
              </form>

              {/* Not found / not eligible */}
              {searchState.status === 'not_found' && (
                <div className="flex flex-col items-center gap-3 text-center py-8">
                  <UserX className="w-12 h-12 text-sbg-text-muted" />
                  <h3 className="font-sans text-sbg-text text-lg font-bold">Nothing to submit</h3>
                  <p className="text-sbg-text-muted text-sm">{searchState.message}</p>
                </div>
              )}

              {/* Step 2 — upload, revealed only for a valid pending applicant */}
              {showUpload && (
                <form onSubmit={handleUpload} className="flex flex-col gap-4 mt-6">
                  <div
                    className="flex items-center gap-2 p-3 rounded-[8px] text-sm"
                    style={{ background: 'var(--accent-dim)', border: '1px solid rgba(79,143,247,0.35)', color: 'var(--text)' }}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-bright)' }} />
                    <span>
                      Application found for <b>{searchState.name}</b>. Upload your COR below.
                    </span>
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

                  {uploadState.status === 'error' && (
                    <div
                      role="alert"
                      className="p-3 rounded-[8px] bg-red-900/20 border border-red-700/50 text-sm text-red-400 font-mono"
                    >
                      {uploadState.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={uploadState.status === 'uploading'}
                    icon={<FileText className="w-4 h-4" />}
                    className="mt-2"
                  >
                    Submit COR
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-sbg-text-muted mt-6">
                Trouble uploading? Email your COR to{' '}
                <a href="mailto:sbg.pupbinan@gmail.com" style={{ color: 'var(--accent-bright)' }}>
                  sbg.pupbinan@gmail.com
                </a>{' '}
                with your student number in the subject line.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
