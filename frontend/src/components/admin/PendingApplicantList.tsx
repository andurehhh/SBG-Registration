// frontend/src/components/admin/PendingApplicantList.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { ApplicantDetailModal } from './ApplicantDetailModal'
import { edgeFn, supabase } from '../../lib/api'
import { insertAuditLog } from '../../lib/auditLog'
import { useToastStore } from '../../store/toast'
import type { Member } from '../../types'

interface PendingApplicantListProps {
  members: Member[]
  onRefresh: () => void
  onSelectionChange?: (selectedIds: string[]) => void
}

export function PendingApplicantList({ members, onRefresh, onSelectionChange }: PendingApplicantListProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const addToast = useToastStore((state) => state.addToast)

  useEffect(() => {
    setSelectedIds(new Set())
  }, [members])

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds))
  }, [selectedIds, onSelectionChange])

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const allSelected = members.length > 0 && selectedIds.size === members.length
      const someSelected = selectedIds.size > 0 && !allSelected
      headerCheckboxRef.current.indeterminate = someSelected
    }
  }, [selectedIds, members.length])

  const handleHeaderCheckboxChange = useCallback(() => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)))
    }
  }, [members, selectedIds.size])

  const handleRowCheckboxChange = useCallback((memberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(memberId)) {
        next.delete(memberId)
      } else {
        next.add(memberId)
      }
      return next
    })
  }, [])

  async function handleQuickApprove(e: React.MouseEvent, member: Member) {
    e.stopPropagation()
    setActionLoading(`approve-${member.id}`)
    try {
      await edgeFn.post(`approve`, { id: member.id })
      addToast(`${member.full_name} has been approved`, 'success')
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (user) {
        insertAuditLog({
          action_type: 'approve',
          actor_email: user.email ?? '',
          actor_id: user.id,
          target_member_id: member.id,
          target_member_name: member.full_name,
          details: null,
        })
      }
      onRefresh()
    } catch {
      addToast('Failed to approve member', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleQuickReject(e: React.MouseEvent, member: Member) {
    e.stopPropagation()
    setActionLoading(`reject-${member.id}`)
    try {
      await edgeFn.post(`reject`, { id: member.id })
      addToast(`${member.full_name} has been rejected`, 'success')
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (user) {
        insertAuditLog({
          action_type: 'reject',
          actor_email: user.email ?? '',
          actor_id: user.id,
          target_member_id: member.id,
          target_member_name: member.full_name,
          details: null,
        })
      }
      onRefresh()
    } catch {
      addToast('Failed to reject member', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
        <h3 className="font-sans text-sbg-text text-lg font-bold">All Clear!</h3>
        <p className="text-sbg-text-muted text-sm">No pending applications at this time.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 w-10">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={members.length > 0 && selectedIds.size === members.length}
                  onChange={handleHeaderCheckboxChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-sbg-accent focus:ring-sbg-accent/40 focus:ring-offset-0 cursor-pointer"
                  aria-label="Select all applicants"
                />
              </th>
              {['Name', 'Student Number', 'Course', 'Year', 'Submitted', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-sbg-text-muted uppercase tracking-wider font-mono">
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
                <td className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => handleRowCheckboxChange(member.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-sbg-accent focus:ring-sbg-accent/40 focus:ring-offset-0 cursor-pointer"
                    aria-label={`Select ${member.full_name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-sbg-text font-medium">{member.full_name}</span>
                    <ChevronRight className="w-3 h-3 text-sbg-text-muted" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text-muted font-mono">{member.student_number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text">{member.course ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text">{member.year_level}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-sbg-text-muted font-mono">
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
