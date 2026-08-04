// frontend/src/components/admin/MemberDetailModal.tsx
import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { IdCard } from '../id-card/IdCard'
import { assignSticker, formatDate } from '../../lib/utils'
import type { Member, MemberStatus } from '../../types'

interface MemberDetailModalProps {
  member: Member
  onClose: () => void
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-sbg-text-muted flex-shrink-0 pt-0.5 font-mono">{label}</span>
      <span className="text-sm text-white text-right break-all font-mono">{value ?? '—'}</span>
    </div>
  )
}

function LinkField({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return <Field label={label} value="—" />
  }
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-sbg-text-muted flex-shrink-0 pt-0.5 font-mono">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-white hover:underline transition-colors"
      >
        View file
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

export function MemberDetailModal({ member, onClose }: MemberDetailModalProps) {
  const stickerId = member.sticker_id ?? assignSticker(member.id)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-sbg-surface border border-white/[0.06] w-full max-w-4xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-sans text-white text-xl font-bold leading-tight">
              {member.full_name}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sbg-text-muted text-sm font-mono">{member.student_number}</span>
              {member.sbg_id && (
                <span className="text-white text-sm font-mono">{member.sbg_id}</span>
              )}
              <Badge variant={member.status as MemberStatus}>{member.status}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={onClose}
            aria-label="Close modal"
            className="flex-shrink-0 ml-4"
          />
        </div>

        {/* Body */}
        <div className="relative p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Identity</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-1">
                <Field label="SBG ID" value={member.sbg_id} />
                <Field label="School Year" value={member.school_year} />
                <Field label="Student No." value={member.student_number} />
                <Field label="Full Name" value={member.full_name} />
                <Field label="Gender" value={member.gender} />
              </div>
            </section>

            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Academic</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-1">
                <Field label="Course" value={member.course} />
                <Field label="Year Level" value={member.year_level} />
                <Field label="Section" value={member.section} />
              </div>
            </section>

            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Contact</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-1">
                <Field label="Personal Email" value={member.email} />
                <Field label="Scholar Email" value={member.scholar_email} />
              </div>
            </section>

            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Attachments</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-1">
                <LinkField label="COR" url={member.cor_url} />
                <LinkField label="Proof of Share" url={member.proof_of_share_url} />
              </div>
            </section>

            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Record</h3>
              <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-1">
                <Field label="Status" value={<Badge variant={member.status as MemberStatus}>{member.status}</Badge>} />
                <Field label="Registered" value={formatDate(member.created_at)} />
                <Field label="Last Updated" value={formatDate(member.updated_at)} />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {member.skills.length > 0 && (
              <section>
                <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">AWS Interests</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] p-4">
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {member.why_join && (
              <section>
                <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Why Join SBG</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{member.why_join}</p>
                </div>
              </section>
            )}

            {member.expectations && (
              <section>
                <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Expectations</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{member.expectations}</p>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-3 font-mono">Digital ID Card</h3>
              {member.status === 'approved' ? (
                <div className="bg-white/[0.03] border border-white/[0.06] p-4 flex justify-center">
                  <IdCard member={member} stickerId={stickerId} />
                </div>
              ) : (
                <div className="bg-white/[0.03] border border-white/[0.06] p-6 flex flex-col items-center gap-2">
                  <p className="text-sbg-text-muted text-sm text-center font-mono">
                    ID card is only available for approved members.
                  </p>
                  <Badge variant={member.status as MemberStatus}>{member.status}</Badge>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
