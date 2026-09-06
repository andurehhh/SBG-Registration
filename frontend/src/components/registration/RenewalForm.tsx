// frontend/src/components/registration/RenewalForm.tsx
import { useState } from 'react'
import { CheckCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../ui/Input'
import { FileUpload } from '../ui/FileUpload'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { supabase, edgeFn, ApiError } from '../../lib/api'
import type { Member } from '../../types'

type RenewalStep = 'verify' | 'upload' | 'success'

interface MemberData {
  id: string
  full_name: string
  student_number: string
  email: string
  scholar_email: string | null
  course: string
  year_level: number
  section: string
  gender: string | null
  skills: string[]
  why_join: string | null
  expectations: string | null
}

export function RenewalForm() {
  const navigate = useNavigate()

  // Verification state
  const [sbgId, setSbgId] = useState('')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [memberData, setMemberData] = useState<MemberData | null>(null)

  // File state
  const [corFile, setCorFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [corError, setCorError] = useState<string | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)

  // Submission state
  const [step, setStep] = useState<RenewalStep>('verify')
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function verifySbgId(value?: string) {
    const idToVerify = value ?? sbgId
    if (!idToVerify.trim()) {
      setVerifyError('Please enter your SBG ID')
      return
    }

    setVerifyLoading(true)
    setVerifyError(null)
    setMemberData(null)

    try {
      // First check the renewal view (only shows inactive members eligible for renewal)
      const { data, error } = await supabase
        .from('member_renewal_view')
        .select('id, full_name, status, sbg_id, student_number, email, scholar_email, course, year_level, section, gender, skills, why_join, expectations')
        .eq('student_number', idToVerify.trim())
        .single()

      if (!error && data) {
        // Found in renewal view — eligible for renewal
        const member = data as unknown as Member

        // View only returns inactive members, so no need to check status
        // Success — store member data
        setMemberData({
          id: member.id,
          full_name: member.full_name,
          student_number: member.student_number,
          email: member.email,
          scholar_email: member.scholar_email,
          course: member.course,
          year_level: member.year_level,
          section: member.section,
          gender: member.gender,
          skills: member.skills ?? [],
          why_join: member.why_join,
          expectations: member.expectations,
        })
        setStep('upload')
        return
      }

      // Not found in renewal view — check if they exist at all (approved/pending)
      const { data: publicData } = await supabase
        .from('member_public_view')
        .select('id, status')
        .eq('student_number', idToVerify.trim())
        .single()

      if (publicData) {
        // They exist but are NOT inactive — membership is still active for this semester
        if (publicData.status === 'approved') {
          setVerifyError('Your membership is still active for this semester. No renewal needed!')
        } else {
          setVerifyError('Your membership is still active for this semester. No renewal needed!')
        }
      } else {
        // Truly not found anywhere
        setVerifyError('Student number not found. If you\'re a new member, please use the "New Member" form.')
      }
    } catch {
      setVerifyError('Failed to verify SBG ID. Please try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate files
    let hasError = false
    if (!corFile) {
      setCorError('COR file is required')
      hasError = true
    }
    if (!proofFile) {
      setProofError('Proof of Share file is required')
      hasError = true
    }
    if (hasError || !memberData) return

    setSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()
      formData.append('full_name', memberData.full_name)
      formData.append('student_number', memberData.student_number)
      formData.append('course', memberData.course)
      formData.append('year_level', String(memberData.year_level))
      formData.append('section', memberData.section)
      formData.append('email', memberData.email)
      formData.append('scholar_email', memberData.scholar_email ?? '')
      formData.append('gender', memberData.gender ?? '')
      memberData.skills.forEach((skill) => formData.append('skills', skill))
      formData.append('why_join', memberData.why_join ?? '')
      formData.append('expectations', memberData.expectations ?? '')
      formData.append('cor_file', corFile!)
      formData.append('proof_of_share_file', proofFile!)

      await edgeFn.postForm('register', formData)
      setStep('success')
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setSbgId('')
    setVerifyError(null)
    setMemberData(null)
    setCorFile(null)
    setProofFile(null)
    setCorError(null)
    setProofError(null)
    setStep('verify')
    setSubmitting(false)
    setServerError(null)
  }

  // Success state
  if (step === 'success') {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-6 py-8">
          <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-sans text-sbg-text text-xl font-bold">
              Renewal Submitted!
            </h2>
            <p className="text-sbg-text-muted text-sm">
              Welcome back, <span className="text-sbg-text font-medium">{memberData?.full_name}</span>!
            </p>
            <p className="text-sbg-text-muted text-sm max-w-sm">
              Your renewal application has been submitted. We'll notify you at{' '}
              <span className="text-sbg-text font-mono">{memberData?.email}</span>{' '}
              once it's reviewed.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              icon={<Search className="w-4 h-4" />}
              onClick={() => navigate('/id-finder')}
              className="w-full"
            >
              Check my ID Card
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full"
            >
              Submit Another Renewal
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* SBG ID Verification */}
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Returning members: enter the student number from your previous membership to renew for this semester.
            You'll then re-upload your updated Certificate of Registration and Proof of Share.
          </p>
          <div className="flex flex-col gap-1">
            <Input
              label="Student Number"
              placeholder="2026-12345-BN-0"
              autoComplete="off"
              required
              value={sbgId}
              onChange={(e) => {
                setSbgId(e.target.value)
                if (verifyError) setVerifyError(null)
              }}
              onBlur={() => {
                if (sbgId.trim() && !memberData) verifySbgId()
              }}
              error={verifyError ?? undefined}
              disabled={step === 'upload'}
            />
          </div>

          {/* Verification success message */}
          {memberData && step === 'upload' && (
            <div className="p-3 text-sm font-mono" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
              Welcome back, {memberData.full_name}!
            </div>
          )}

          {/* Verify button (only shown before verification) */}
          {step === 'verify' && (
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                onClick={() => verifySbgId()}
                loading={verifyLoading}
                disabled={!sbgId.trim()}
                aria-describedby={!sbgId.trim() ? 'verify-disabled-reason' : undefined}
                className="w-full"
              >
                Verify Student Number
              </Button>
              {!sbgId.trim() && (
                <p id="verify-disabled-reason" className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Enter your student number above to enable verification.
                </p>
              )}
            </div>
          )}
        </div>

        {/* File uploads (shown after verification) */}
        {step === 'upload' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FileUpload
              label="Certificate of Registration (COR)"
              required
              value={corFile}
              onChange={(file) => {
                setCorFile(file)
                if (file) setCorError(null)
              }}
              error={corError ?? undefined}
              hint="Upload your updated COR from the PUP student portal."
            />

            <FileUpload
              label="Proof of Share"
              required
              value={proofFile}
              onChange={(file) => {
                setProofFile(file)
                if (file) setProofError(null)
              }}
              error={proofError ?? undefined}
              hint="Screenshot of your shared SBG application post."
            />

            {serverError && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 text-sm text-red-400 font-mono">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="flex-1"
              >
                Renew Membership
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}
