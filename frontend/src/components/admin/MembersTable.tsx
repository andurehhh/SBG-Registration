// frontend/src/components/admin/MembersTable.tsx
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { MemberDetailModal } from './MemberDetailModal'
import type { Member, MemberStatus } from '../../types'

interface MembersTableProps {
  members: Member[]
}

export function MembersTable({ members }: MembersTableProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

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
        />
      )}
    </>
  )
}
