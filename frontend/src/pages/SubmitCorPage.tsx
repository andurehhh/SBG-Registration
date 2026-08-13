// frontend/src/pages/SubmitCorPage.tsx
import { useState, type FormEvent } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { FileUpload } from '../components/ui/FileUpload'
import { Card } from '../components/ui/Card'
import { edgeFn, ApiError } from '../lib/api'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export default function SubmitCorPage() {
  const [studentNumber, setStudentNumber] = useState('')
  const [corFile, setCorFile] = useState<File | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' })
  const [fieldErrors, setFieldErrors] = useState<{ studentNumber?: string; corFile?: string }>({})

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Validate
    const errors: typeof fieldErrors = {}
    if (!studentNumber.trim()) {
      errors.studentNumber = 'Student number is required'
    }
    if (!corFile) {
      errors.corFile = 'Please select your COR file'
    } else {
      if (corFile.size > 1_048_576) {
        errors.corFile = 'File must be 1 MB or less'
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(corFile.type)) {
        errors.corFile = 'File must be JPEG, PNG, or PDF'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitState({ status: 'submitting' })

    try {
      const formData = new FormData()
      formData.append('student_number', studentNumber.trim())
      formData.append('cor_file', corFile!)

      await edgeFn.postForm('submit-cor', formData)
      setSubmitState({ status: 'success' })
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitState({ status: 'error', message: err.message })
      } else {
        setSubmitState({ status: 'error', message: 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  if (submitState.status === 'success') {
    return (
      <div className="min-h-screen bg-sbg-black grid-bg flex flex-col">
        <div className="relative z-10 px-6 py-4">
          <BackButton to="/" label="Back to Home" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-20">
          <Card>
            <div className="flex flex-col items-center text-center gap-4 py-8 px-4">
              <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h3 className="font-mono text-white text-lg font-bold">COR Submitted</h3>
                <p className="text-sbg-text-muted text-sm mt-2 max-w-xs">
                  Your Certificate of Registration has been uploaded successfully. Your application record has been updated.
                </p>
              </div>
              <a
                href="/id-finder"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-sbg-purple text-white text-sm font-mono hover:bg-sbg-purple-light transition-colors"
              >
                Check your ID status
              </a>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sbg-black grid-bg flex flex-col">
      {/* Top bar */}
      <div className="relative z-10 px-6 py-4">
        <BackButton to="/" label="Back to Home" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/sbg-logo.svg" alt="SBG Logo" className="h-10 w-10" />
              <div className="text-left">
                <h1 className="font-bold text-white text-lg leading-tight">
                  Student Builder Group
                </h1>
                <p className="text-sbg-text-muted text-xs">PUP Biñan Campus</p>
              </div>
            </div>
            <h2 className="font-bold text-white text-2xl mb-2">Submit Your COR</h2>
            <p className="text-sbg-text-muted text-sm">
              Upload your Certificate of Registration to complete your membership application.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Student Number"
                placeholder="2024-12345-BN-0"
                value={studentNumber}
                onChange={(e) => {
                  setStudentNumber(e.target.value)
                  if (fieldErrors.studentNumber) setFieldErrors((p) => ({ ...p, studentNumber: undefined }))
                }}
                error={fieldErrors.studentNumber}
              />

              <FileUpload
                label="Certificate of Registration (COR)"
                value={corFile}
                onChange={(file) => {
                  setCorFile(file)
                  if (fieldErrors.corFile) setFieldErrors((p) => ({ ...p, corFile: undefined }))
                }}
                error={fieldErrors.corFile}
                hint="JPEG, PNG, or PDF — max 1 MB"
              />

              {submitState.status === 'error' && (
                <div className="flex items-start gap-2 p-3 rounded-[8px] bg-red-900/20 border border-red-700/50">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-mono">{submitState.message}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={submitState.status === 'submitting'}
                icon={<Upload className="w-4 h-4" />}
                className="w-full"
              >
                Submit COR
              </Button>
            </form>
          </Card>

          <p className="text-center text-sbg-text-muted text-xs font-mono mt-6">
            Only submit if you registered without a COR previously.
          </p>
        </div>
      </div>
    </div>
  )
}
