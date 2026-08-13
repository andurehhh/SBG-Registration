// frontend/src/components/admin/ApplicantDetailModal.tsx
import { useState } from 'react'
import { X, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { edgeFn, ApiError } from '../../lib/api'
import type { Member, MemberStatus } from '../../types'

interface ApplicantDetailModalProps {
  member: Member
  onClose: () => void
  onAction: () => void
}

export function ApplicantDetailModal({ member, onClose, onAction }: ApplicantDetailModalProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionWarning, setActionWarning] = useState<string | null>(null)

  async function handleApprove() {
    setIsApproving(true)
    setActionError(null)
    setActionWarning(null)
    try {
      const result = await edgeFn.post<{ emailSent: boolean; emailError?: string }>(`approve`, { id: member.id })
      onAction()
      if (result.success && result.data.emailSent) onClose()
      else if (result.success) setActionWarning(result.data.emailError || 'Approved, but the email could not be sent.')
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to approve')
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject() {
    setIsRejecting(true)
    setActionError(null)
    setActionWarning(null)
    try {
      await edgeFn.post(`reject`, { id: member.id })
      onAction()
      onClose()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to reject')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div>
            <h2 className="font-mono text-white text-lg font-bold">{member.full_name}</h2>
            <p className="text-sbg-text-muted text-sm font-mono">{member.student_number}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={member.status as MemberStatus}>{member.status}</Badge>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 text-sbg-text-muted hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          {/* Personal Info */}
          <section>
            <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Course', value: member.course },
                { label: 'Year Level', value: member.year_level },
                { label: 'Section', value: member.section },
                { label: 'Gender', value: member.gender },
                { label: 'Personal Email', value: member.email },
                { label: 'Scholar Email', value: member.scholar_email },
              ].map(({ label, value }) => (
                <div key={label} className="bg-sbg-navy-light rounded-[8px] p-3">
                  <p className="text-[10px] font-mono text-sbg-text-muted uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-white font-mono">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* AWS Interests */}
          {member.skills.length > 0 && (
            <section>
              <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-3">AWS Interests</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* Application Questions */}
          {member.why_join && (
            <section>
              <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-2">Why Join SBG?</h3>
              <p className="text-sm text-sbg-text bg-sbg-navy-light rounded-[8px] p-3 leading-relaxed">{member.why_join}</p>
            </section>
          )}

          {member.expectations && (
            <section>
              <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-2">Expectations</h3>
              <p className="text-sm text-sbg-text bg-sbg-navy-light rounded-[8px] p-3 leading-relaxed">{member.expectations}</p>
            </section>
          )}

          {/* Documents */}
          <section>
            <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-3">Documents</h3>
            <div className="flex gap-3">
              {member.cor_url && (
                <a
                  href={member.cor_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-sbg-navy-light border border-white/10 rounded-[8px] text-sm font-mono text-sbg-purple hover:border-sbg-purple/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View COR
                </a>
              )}
              {member.proof_of_share_url && (
                <a
                  href={member.proof_of_share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-sbg-navy-light border border-white/10 rounded-[8px] text-sm font-mono text-sbg-purple hover:border-sbg-purple/50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Proof of Share
                </a>
              )}
            </div>
          </section>

          {actionError && (
            <p className="text-sm text-red-400 font-mono">{actionError}</p>
          )}
          {actionWarning && (
            <p className="text-sm text-yellow-400 font-mono">{actionWarning}</p>
          )}
        </div>

        {/* Actions */}
        {member.status === 'pending' && (
          <div className="flex gap-3 p-6 border-t border-white/[0.08]">
            <Button
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              loading={isRejecting}
              disabled={isApproving}
              onClick={handleReject}
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              icon={<CheckCircle className="w-4 h-4" />}
              loading={isApproving}
              disabled={isRejecting}
              onClick={handleApprove}
              className="flex-1"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
