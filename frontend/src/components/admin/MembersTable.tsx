// frontend/src/components/admin/MembersTable.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { MemberDetailModal } from './MemberDetailModal'
import type { Member, MemberStatus } from '../../types'

interface MembersTableProps {
  members: Member[]
  selectedIds: Set<string>
  onSelectionChange: (selectedIds: string[]) => void
  /** Called after a member is changed (e.g. removed) so the list can refresh. */
  onChanged?: () => void
}

export function MembersTable({ members, selectedIds, onSelectionChange, onChanged }: MembersTableProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const headerCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onSelectionChange(Array.from(selectedIds))
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
      onSelectionChange([])
    } else {
      onSelectionChange(members.map((m) => m.id))
    }
  }, [members, selectedIds.size, onSelectionChange])

  const handleRowCheckboxChange = useCallback((memberId: string) => {
    const next = selectedIds.has(memberId)
      ? new Set([...selectedIds].filter((id) => id !== memberId))
      : new Set([...selectedIds, memberId])
    onSelectionChange(Array.from(next))
  }, [selectedIds, onSelectionChange])

  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sbg-text-muted text-sm font-mono">No members found.</p>
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
                  aria-label="Select all members"
                />
              </th>
              {['Name', 'Student Number', 'Course', 'Year/Section', 'Status', 'SBG ID', 'Registered'].map((h) => (
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
                    <span className="text-sm text-white font-medium">{member.full_name}</span>
                    <ChevronRight className="w-3 h-3 text-sbg-text-muted" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-sbg-text-muted font-mono">{member.student_number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{member.course ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">
                    {member.year_level} — {member.section}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={member.status as MemberStatus}>{member.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-white font-mono">{member.sbg_id ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-sbg-text-muted font-mono">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onRemoved={onChanged}
        />
      )}
    </>
  )
}
