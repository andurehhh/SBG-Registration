// frontend/src/components/admin/PendingApplicantList.tsx
import { useState } from 'react'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { ApplicantDetailModal } from './ApplicantDetailModal'
import { edgeFn } from '../../lib/api'
import type { Member } from '../../types'

interface PendingApplicantListProps {
  members: Member[]
  onRefresh: () => void
}

export function PendingApplicantList({ members, onRefresh }: PendingApplicantListProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleQuickApprove(e: React.MouseEvent, member: Member) {
    e.stopPropagation()
    setActionLoading(`approve-${member.id}`)
    try {
      await edgeFn.post(`approve`, { id: member.id })
      onRefresh()
    } finally {
      setActionLoading(null)
    }
  }

  async function handleQuickReject(e: React.MouseEvent, member: Member) {
    e.stopPropagation()
    setActionLoading(`reject-${member.id}`)
    try {
      await edgeFn.post(`reject`, { id: member.id })
      onRefresh()
    } finally {
      setActionLoading(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <CheckCircle className="w-12 h-12 text-green-400" />
        <h3 className="font-mono text-white text-lg font-bold">All Clear!</h3>
        <p className="text-sbg-text-muted text-sm">No pending applications at this time.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {['Name', 'Student Number', 'Course', 'Year', 'Submitted', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-mono text-sbg-text-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{member.full_name}</span>
                    <ChevronRight className="w-3 h-3 text-sbg-text-muted" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-sbg-text-muted">{member.student_number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text">{member.course ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text">{member.year_level}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-sbg-text-muted">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      loading={actionLoading === `reject-${member.id}`}
                      onClick={(e) => handleQuickReject(e, member)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      loading={actionLoading === `approve-${member.id}`}
                      onClick={(e) => handleQuickApprove(e, member)}
                    >
                      Approve
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <ApplicantDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onAction={onRefresh}
        />
      )}
    </>
  )
}
