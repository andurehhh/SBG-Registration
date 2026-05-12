// frontend/src/components/admin/AnnouncementComposer.tsx
import { useState, useEffect, useCallback } from 'react'
import { Send, Eye, X, Search, Users } from 'lucide-react'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { api, ApiError } from '../../lib/api'
import type { Member, AnnouncementPayload, MemberStatus, PaginatedResponse } from '../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RECIPIENT_OPTIONS = [
  { value: 'all', label: 'All Members' },
  { value: 'group', label: 'Specific Groups' },
  { value: 'individual', label: 'Individual Members' },
]

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'inactive', label: 'Inactive' },
]

const YEAR_LEVEL_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface SendResult {
  sent: number
  failed: { email: string; error: string }[]
}

// ─── Email Preview Modal ──────────────────────────────────────────────────────

interface PreviewModalProps {
  subject: string
  body: string
  signature: string
  onClose: () => void
}

function PreviewModal({ subject, body, signature, onClose }: PreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <span className="font-mono text-white text-sm font-bold tracking-wide">EMAIL PREVIEW</span>
          <button
            onClick={onClose}
            className="text-sbg-text-muted hover:text-white transition-colors rounded-[8px] p-1 focus:outline-none focus:ring-2 focus:ring-sbg-purple"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email chrome */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="bg-sbg-black rounded-[8px] border border-white/[0.08] overflow-hidden">
            {/* Email header bar */}
            <div className="px-5 py-3 border-b border-white/[0.08] bg-sbg-navy-light">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-sbg-text-muted w-14">FROM</span>
                <span className="text-xs text-sbg-text">SBG Admin &lt;noreply@sbg.com&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-sbg-text-muted w-14">SUBJECT</span>
                <span className="text-sm font-mono text-white font-bold">
                  {subject || <span className="text-sbg-text-muted italic">(no subject)</span>}
                </span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-5 py-5">
              <div className="text-sm text-sbg-text whitespace-pre-wrap leading-relaxed">
                {body || <span className="text-sbg-text-muted italic">(no body)</span>}
              </div>

              {signature && (
                <>
                  <div className="my-4 border-t border-white/[0.08]" />
                  <div className="text-sm text-sbg-text-muted">{signature}</div>
                </>
              )}
            </div>

            {/* Email footer */}
            <div className="px-5 py-3 border-t border-white/[0.08] bg-sbg-navy-light">
              <p className="text-xs text-sbg-text-muted font-mono text-center">
                Student Builder Group — PUP Biñan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Individual Member Selector ───────────────────────────────────────────────

interface MemberSelectorProps {
  selectedIds: Set<string>
  onToggle: (id: string) => void
}

function MemberSelector({ selectedIds, onToggle }: MemberSelectorProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get<PaginatedResponse<Member>>('/api/admin/members?status=approved&limit=500')
      .then((res) => {
        if (!cancelled && res.success) {
          const raw = res as unknown as { success: true; data: Member[] }
          setMembers(raw.data ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load members')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.student_number.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 bg-sbg-navy-light rounded-[8px] border border-white/[0.08] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-sbg-text-muted">SELECT RECIPIENTS</span>
        {selectedIds.size > 0 && (
          <span className="text-xs font-mono text-sbg-purple">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sbg-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, student number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={[
            'w-full pl-8 pr-3 py-2 rounded-[8px] text-sm text-white',
            'bg-sbg-navy border border-white/10 transition-colors duration-150',
            'placeholder:text-sbg-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0 focus:border-sbg-purple',
          ].join(' ')}
        />
      </div>

      {/* Member list */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-sbg-text-muted text-sm">
          <span className="w-4 h-4 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          Loading members...
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 font-mono py-2">{error}</p>
      )}

      {!loading && !error && (
        <div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-sbg-text-muted font-mono py-3 text-center">
              No members match your search
            </p>
          ) : (
            filtered.map((member) => {
              const checked = selectedIds.has(member.id)
              return (
                <label
                  key={member.id}
                  className={[
                    'flex items-center gap-3 px-3 py-2 rounded-[8px] cursor-pointer transition-colors',
                    checked
                      ? 'bg-sbg-purple/10 border border-sbg-purple/30'
                      : 'hover:bg-white/5 border border-transparent',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(member.id)}
                    className="w-4 h-4 rounded accent-sbg-purple cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{member.full_name}</p>
                    <p className="text-xs font-mono text-sbg-text-muted">{member.student_number}</p>
                  </div>
                  <span className="text-xs text-sbg-text-muted truncate max-w-[140px]">
                    {member.email}
                  </span>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnnouncementComposer() {
  // Form state
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [signature, setSignature] = useState('')

  // Recipients
  const [recipientType, setRecipientType] = useState<'all' | 'group' | 'individual'>('all')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterYearLevel, setFilterYearLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState<MemberStatus | ''>('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const toggleMember = useCallback((id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Reset result when form changes
  useEffect(() => {
    setSendResult(null)
    setSendError(null)
  }, [subject, body, signature, recipientType, filterCourse, filterYearLevel, filterStatus, selectedMemberIds])

  const canSend =
    subject.trim() !== '' &&
    body.trim() !== '' &&
    (recipientType !== 'individual' || selectedMemberIds.size > 0)

  async function handleSend() {
    if (!canSend) return

    setIsSending(true)
    setSendResult(null)
    setSendError(null)

    const payload: AnnouncementPayload = {
      subject,
      body,
      signature,
      recipients: {
        type: recipientType,
        filters:
          recipientType === 'group'
            ? {
                course: filterCourse.trim() || undefined,
                year_level: filterYearLevel ? Number(filterYearLevel) : undefined,
                status: (filterStatus as MemberStatus) || undefined,
              }
            : undefined,
        memberIds:
          recipientType === 'individual'
            ? Array.from(selectedMemberIds)
            : undefined,
      },
    }

    try {
      const result = await api.post<SendResult>('/api/admin/announcements/send', payload)
      if (result.success) {
        setSendResult(result.data)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // 207 Partial success — data may still contain sent/failed counts
        const data = err.data as { data?: SendResult } | null
        if (err.status === 207 && data?.data) {
          setSendResult(data.data)
        } else {
          setSendError(err.message)
        }
      } else {
        setSendError('Failed to send announcement')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      {showPreview && (
        <PreviewModal
          subject={subject}
          body={body}
          signature={signature}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="flex flex-col gap-6 w-full">
        <Card>
          <div className="flex flex-col gap-0">
            {/* Header */}
            <div className="pb-4 border-b border-white/[0.08] mb-4">
              <h2 className="font-mono text-white text-lg font-bold">Compose Announcement</h2>
              <p className="text-xs text-sbg-text-muted mt-1">
                Send email announcements to SBG members
              </p>
            </div>

            {/* Message section */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-mono text-sbg-text-muted tracking-widest">MESSAGE</p>

              <Input
                label="Subject"
                placeholder="Announcement subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <Textarea
                label="Body"
                placeholder="Write your announcement here..."
                minHeight="150px"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />

              <Input
                label="Signature (optional)"
                placeholder="e.g. SBG Admin Team"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div className="border-b border-white/[0.08] my-5" />

            {/* Recipients section */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-mono text-sbg-text-muted tracking-widest">RECIPIENTS</p>

              <Select
                label="Send to"
                options={RECIPIENT_OPTIONS}
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value as typeof recipientType)
                  setSelectedMemberIds(new Set())
                }}
              />

              {/* Group filters */}
              {recipientType === 'group' && (
                <div className="flex flex-col gap-3 p-4 bg-sbg-navy-light rounded-[8px] border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-sbg-text-muted" />
                    <span className="text-xs font-mono text-sbg-text-muted">FILTER BY GROUP</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Course"
                      placeholder="e.g. BSIT"
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                    />
                    <Select
                      label="Year Level"
                      options={[{ value: '', label: 'All years' }, ...YEAR_LEVEL_OPTIONS]}
                      value={filterYearLevel}
                      onChange={(e) => setFilterYearLevel(e.target.value)}
                    />
                    <Select
                      label="Status"
                      options={[{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS]}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as MemberStatus | '')}
                    />
                  </div>
                  <p className="text-xs text-sbg-text-muted">
                    Leave filters blank to include all members in that group.
                  </p>
                </div>
              )}

              {/* Individual member selector */}
              {recipientType === 'individual' && (
                <MemberSelector
                  selectedIds={selectedMemberIds}
                  onToggle={toggleMember}
                />
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-white/[0.08] my-5" />

            {/* Result feedback */}
            {sendResult && (
              <div className={[
                'p-4 rounded-[8px] border mb-4',
                sendResult.failed.length > 0
                  ? 'bg-yellow-900/20 border-yellow-700/40'
                  : 'bg-green-900/20 border-green-700/50',
              ].join(' ')}>
                <p className="text-sm text-green-400 font-mono font-bold">
                  ✓ Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? 's' : ''}
                </p>
                {sendResult.failed.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-mono text-red-400 mb-1">
                      ✗ {sendResult.failed.length} delivery failure{sendResult.failed.length !== 1 ? 's' : ''}
                    </p>
                    <ul className="flex flex-col gap-1 mt-1">
                      {sendResult.failed.map((f) => (
                        <li key={f.email} className="text-xs font-mono text-sbg-text-muted">
                          <span className="text-red-400">{f.email}</span>
                          <span className="text-white/30 mx-1">—</span>
                          {f.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {sendError && (
              <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-[8px] mb-4">
                <p className="text-sm text-red-400 font-mono">{sendError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => setShowPreview(true)}
                disabled={!subject && !body}
              >
                Preview Email
              </Button>
              <Button
                icon={<Send className="w-4 h-4" />}
                loading={isSending}
                disabled={!canSend}
                onClick={handleSend}
              >
                Send Announcement
              </Button>
            </div>

            {recipientType === 'individual' && selectedMemberIds.size === 0 && (
              <p className="text-xs text-sbg-text-muted font-mono mt-2">
                Select at least one member to send.
              </p>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
