// frontend/src/components/registration/StepAttachments.tsx
import { useState, useEffect } from 'react'
import { FileUpload } from '../ui/FileUpload'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'
import { edgeFn, ApiError, fetchAppSettings } from '../../lib/api'

interface StepAttachmentsProps {
  onBack: () => void
}

export function StepAttachments({ onBack }: StepAttachmentsProps) {
  const store = useRegistrationStore()
  const [corError, setCorError] = useState<string | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)
  const [corRequired, setCorRequired] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    fetchAppSettings().then((settings) => {
      setCorRequired(settings.cor_required)
      setSettingsLoaded(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate files present
    let hasError = false
    if (corRequired && !store.cor_file) {
      setCorError('Certificate of Registration is required')
      hasError = true
    }
    if (!store.proof_of_share_file) {
      setProofError('Proof of Share is required')
      hasError = true
    }
    if (hasError) return

    store.setSubmissionStatus('submitting')
    store.setServerError(null)

    try {
      const formData = new FormData()
      formData.append('full_name', store.full_name)
      formData.append('student_number', store.student_number)
      formData.append('course', store.course)
      formData.append('year_level', String(store.year_level ?? 1))
      formData.append('section', store.section)
      formData.append('email', store.email)
      formData.append('scholar_email', store.scholar_email)
      formData.append('gender', store.gender)
      store.skills.forEach((skill) => formData.append('skills', skill))
      formData.append('why_join', store.why_join)
      formData.append('expectations', store.expectations)
      if (store.heard_from) {
        formData.append('heard_from', store.heard_from)
      }
      if (store.cor_file) {
        formData.append('cor_file', store.cor_file)
      }
      formData.append('proof_of_share_file', store.proof_of_share_file!)

      await edgeFn.postForm('register', formData)
      store.setSubmissionStatus('success')
    } catch (err) {
      store.setSubmissionStatus('error')
      if (err instanceof ApiError) {
        store.setServerError(err.message)
      } else {
        store.setServerError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <FileUpload
          label={`Certificate of Registration (COR)${!corRequired && settingsLoaded ? ' (optional)' : ''}`}
          required={corRequired}
          value={store.cor_file}
          onChange={(file) => {
            store.setField('cor_file', file)
            if (file) setCorError(null)
          }}
          error={corError ?? undefined}
          hint={
            corRequired
              ? 'Upload your COR from the PUP student portal.'
              : "Optional — you can submit your COR later if you don't have it yet."
          }
        />

        <FileUpload
          label="Proof of Share"
          required
          value={store.proof_of_share_file}
          onChange={(file) => {
            store.setField('proof_of_share_file', file)
            if (file) setProofError(null)
          }}
          error={proofError ?? undefined}
          hint="Upload a screenshot showing you shared our recruitment post publicly."
        />
      </div>



      {store.serverError && (
        <div className="p-3 rounded-[8px] bg-red-900/20 border border-red-700/50 text-sm text-red-400 font-mono">
          {store.serverError}
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={store.submissionStatus === 'submitting'}
          className="flex-1"
        >
          ← Back
        </Button>
        <Button
          type="submit"
          loading={store.submissionStatus === 'submitting'}
          className="flex-1"
        >
          Submit Application
        </Button>
      </div>
    </form>
  )
}
