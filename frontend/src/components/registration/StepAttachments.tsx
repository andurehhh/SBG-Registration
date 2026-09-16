// frontend/src/components/registration/StepAttachments.tsx
import { useState, useEffect } from 'react'
import { FileUpload } from '../ui/FileUpload'
import { Button } from '../ui/Button'
import { useRegistrationStore } from '../../store/registration'
import { edgeFn, ApiError, fetchAppSettings } from '../../lib/api'
import { registrationStep1Schema, registrationStep2Schema } from '../../lib/validations'

interface StepAttachmentsProps {
  onBack: () => void
}

export function StepAttachments({ onBack }: StepAttachmentsProps) {
  const store = useRegistrationStore()
  const [corError, setCorError] = useState<string | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)
  const [stepError, setStepError] = useState<string | null>(null)
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
    setStepError(null)

    // Re-validate the earlier steps against their schemas. StepAttachments is
    // not a react-hook-form, so without this a blank field left in the store
    // (e.g. via the "Other" course flow or editing after Back) would slip
    // straight through to the server. Guard it here before building FormData.
    const step1 = registrationStep1Schema.safeParse({
      full_name: store.full_name,
      student_number: store.student_number,
      course: store.course,
      year_level: store.year_level ?? undefined,
      section: store.section,
      email: store.email,
      scholar_email: store.scholar_email,
      gender: store.gender,
      skills: store.skills,
    })
    if (!step1.success) {
      setStepError(
        'Some details in "Personal Information" are missing or invalid. Please go back and complete every required field.'
      )
      store.goToStep(1)
      return
    }

    const step2 = registrationStep2Schema.safeParse({
      why_join: store.why_join,
      expectations: store.expectations,
    })
    if (!step2.success) {
      setStepError(
        'Your answers in "Application Questions" are incomplete. Each response needs at least 25 characters.'
      )
      store.goToStep(2)
      return
    }

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
          label="Certificate of Registration (COR)"
          required={corRequired}
          optional={!corRequired && settingsLoaded}
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

      {stepError && (
        <div role="alert" className="p-3 rounded-[8px] bg-red-900/20 border border-red-700/50 text-sm text-red-400">
          {stepError}
        </div>
      )}

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
