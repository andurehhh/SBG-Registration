// frontend/src/components/admin/AnnouncementComposer.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Send, Eye, X, ChevronDown, Trash2, Image } from 'lucide-react'
import { Button } from '../ui/Button'
import { supabase, edgeFn, ApiError } from '../../lib/api'
import { insertAuditLog } from '../../lib/auditLog'
import { useToastStore } from '../../store/toast'
import type { Member, AnnouncementPayload, MemberStatus } from '../../types'

interface EmailTemplate {
  id: string
  name: string
  headerUrl: string | null
  footerUrl: string | null
  thumbnail: string
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'none',
    name: 'Plain (No images)',
    headerUrl: null,
    footerUrl: null,
    thumbnail: '',
  },
  {
    id: 'sbg-default',
    name: 'SBG Default',
    headerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/header-default',
    footerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/footer-default',
    thumbnail: 'https://res.cloudinary.com/dkue2jyea/image/upload/w_200,q_60/sbg-email/header-default',
  },
  {
    id: 'sbg-event',
    name: 'Event Announcement',
    headerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/header-event',
    footerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/footer-default',
    thumbnail: 'https://res.cloudinary.com/dkue2jyea/image/upload/w_200,q_60/sbg-email/header-event',
  },
  {
    id: 'sbg-update',
    name: 'General Update',
    headerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/header-update',
    footerUrl: 'https://res.cloudinary.com/dkue2jyea/image/upload/v1/sbg-email/footer-default',
    thumbnail: 'https://res.cloudinary.com/dkue2jyea/image/upload/w_200,q_60/sbg-email/header-update',
  },
]

interface SubjectPreset {
  label: string
  value: string
}

const SUBJECT_PRESETS: SubjectPreset[] = [
  { label: 'Custom...', value: '' },
  { label: 'New Event', value: 'New Event — AWS SBG PUP Biñan' },
  { label: 'General Announcement', value: 'General Announcement — AWS SBG PUP Biñan' },
]

interface SendResult {
  sent: number
  failed: { email: string; error: string }[]
}

interface PreviewModalProps {
  subject: string
  body: string
  signature: string
  template: EmailTemplate
  onClose: () => void
}

function PreviewModal({ subject, body, signature, template, onClose }: PreviewModalProps) {
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
      <div className="bg-sbg-surface border border-white/[0.06] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <span className="text-white text-sm font-bold tracking-wide font-mono">EMAIL PREVIEW</span>
          <button
            onClick={onClose}
            className="text-sbg-text-muted hover:text-white transition-colors p-1"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            {template.headerUrl && (
              <div className="w-full">
                <img src={template.headerUrl} alt="Email header" className="w-full h-auto block" />
              </div>
            )}

            <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-sbg-text-muted w-14 font-mono">FROM</span>
                <span className="text-xs text-white">SBG Admin &lt;noreply@sbg.com&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-sbg-text-muted w-14 font-mono">SUBJECT</span>
                <span className="text-sm text-white font-bold font-mono">
                  {subject || <span className="text-sbg-text-muted italic">(no subject)</span>}
                </span>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                {body || <span className="text-sbg-text-muted italic">(no body)</span>}
              </div>

              {signature && (
                <>
                  <div className="my-4 border-t border-white/[0.06]" />
                  <div className="text-sm text-sbg-text-muted">{signature}</div>
                </>
              )}
            </div>

            {template.footerUrl && (
              <div className="w-full border-t border-white/[0.06]">
                <img src={template.footerUrl} alt="Email footer" className="w-full h-auto block" />
              </div>
            )}

            {!template.footerUrl && (
              <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.03]">
                <p className="text-xs text-sbg-text-muted text-center font-mono">
                  Student Builder Group — PUP Biñan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white text-xs font-mono">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:text-white transition-colors ml-0.5"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

interface InlineMemberSearchProps {
  selectedIds: Set<string>
  selectedMembers: Member[]
  onToggle: (member: Member) => void
}

function InlineMemberSearch({ selectedIds, selectedMembers, onToggle }: InlineMemberSearchProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    supabase
      .from('Member')
      .select('id, email, full_name, student_number')
      .eq('status', 'approved')
      .limit(500)
      .then(({ data }) => {
        if (!cancelled) {
          setMembers(data as unknown as Member[] ?? [])
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = members.filter((m) => {
    if (selectedIds.has(m.id)) return false
    const q = search.toLowerCase()
    if (!q) return true
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  })

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedMembers.map((m) => (
          <Chip
            key={m.id}
            label={m.full_name}
            onRemove={() => onToggle(m)}
          />
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={selectedMembers.length === 0 ? 'Search members...' : 'Add more...'}
            className="w-full bg-transparent text-sm text-white placeholder:text-sbg-text-muted focus:outline-none py-1"
          />
        </div>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-sbg-surface border border-white/[0.06] shadow-xl max-h-48 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sbg-text-muted text-xs">
              <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-3 text-xs text-sbg-text-muted">No members found</p>
          ) : (
            filtered.slice(0, 20).map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onToggle(member)
                  setSearch('')
                  inputRef.current?.focus()
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{member.full_name}</p>
                  <p className="text-xs text-sbg-text-muted font-mono">{member.email}</p>
                </div>
                <span className="text-xs text-sbg-text-muted shrink-0 font-mono">
                  {member.student_number}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface RecipientSwitcherProps {
  value: 'all' | 'group' | 'individual' | 'devteam' | 'pending'
  onChange: (v: 'all' | 'group' | 'individual' | 'devteam' | 'pending') => void
}

function RecipientSwitcher({ value, onChange }: RecipientSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const labels: Record<string, string> = {
    all: 'All Members',
    group: 'Skill Builder Department',
    individual: 'Individual',
    devteam: 'DevTeam',
    pending: 'Pending Applicants',
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-xs text-white hover:text-sbg-text-muted transition-colors"
      >
        {labels[value]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 z-[100] bg-sbg-surface border border-white/[0.06] shadow-xl flex flex-col" style={{ right: 0, minWidth: '200px' }}>
          {(['all', 'group', 'devteam', 'pending', 'individual'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt as 'all' | 'group' | 'individual' | 'devteam' | 'pending'); setOpen(false) }}
              className={[
                'w-full text-left px-3 py-2 text-xs transition-colors',
                value === opt ? 'text-white bg-white/10' : 'text-sbg-text-muted hover:bg-white/5',
              ].join(' ')}
            >
              {labels[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AnnouncementComposer() {
  const addToast = useToastStore((state) => state.addToast)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [signature, setSignature] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(EMAIL_TEMPLATES[0])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showSubjectPresets, setShowSubjectPresets] = useState(false)
  const subjectDropdownRef = useRef<HTMLDivElement>(null)

  const [recipientType, setRecipientType] = useState<'all' | 'group' | 'individual' | 'devteam' | 'pending'>('all')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterYearLevel, setFilterYearLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState<MemberStatus | ''>('')
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const selectedMemberIds = new Set(selectedMembers.map((m) => m.id))

  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const toggleMember = useCallback((member: Member) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id)
      if (exists) return prev.filter((m) => m.id !== member.id)
      return [...prev, member]
    })
  }, [])

  const handleRecipientTypeChange = useCallback((type: 'all' | 'group' | 'individual' | 'devteam' | 'pending') => {
    setRecipientType(type)
    setSelectedMembers([])
    setFilterCourse('')
    setFilterYearLevel('')
    setFilterStatus('')
  }, [])

  useEffect(() => {
    setSendResult(null)
    setSendError(null)
  }, [subject, body, signature, recipientType, filterCourse, filterYearLevel, filterStatus, selectedMembers])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(e.target as Node)) {
        setShowSubjectPresets(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const canSend =
    subject.trim() !== '' &&
    body.trim() !== '' &&
    (recipientType !== 'individual' || selectedMembers.length > 0)

  function handleDiscard() {
    setSubject('')
    setBody('')
    setSignature('')
    setSelectedTemplate(EMAIL_TEMPLATES[0])
    setShowTemplatePicker(false)
    setRecipientType('all')
    setSelectedMembers([])
    setFilterCourse('')
    setFilterYearLevel('')
    setFilterStatus('')
    setSendResult(null)
    setSendError(null)
  }

  async function handleSend() {
    if (!canSend) return

    setIsSending(true)
    setSendResult(null)
    setSendError(null)

    const payload: AnnouncementPayload = {
      subject,
      body,
      signature,
      headerImageUrl: selectedTemplate.headerUrl ?? undefined,
      footerImageUrl: selectedTemplate.footerUrl ?? undefined,
      recipients: {
        type: recipientType === 'devteam' || recipientType === 'pending' || recipientType === 'group' ? 'group' : recipientType,
        filters:
          recipientType === 'group'
            ? { status: 'approved' as MemberStatus }
            : recipientType === 'devteam'
            ? { course: 'DevTeam' }
            : recipientType === 'pending'
            ? { status: 'pending' as MemberStatus }
            : undefined,
        memberIds:
          recipientType === 'individual'
            ? selectedMembers.map((m) => m.id)
            : undefined,
      },
    }

    try {
      const result = await edgeFn.post<SendResult>('send-announcement', payload)
      if (result.success) {
        setSendResult(result.data)
        if (result.data.failed.length > 0) {
          addToast('Announcement sent with some delivery issues', 'warning')
        } else {
          addToast('Announcement sent successfully', 'success')
        }
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (user) {
          insertAuditLog({
            action_type: 'announcement_sent',
            actor_email: user.email ?? '',
            actor_id: user.id,
            target_member_id: null,
            target_member_name: null,
            details: { subject, recipient_count: result.data.sent },
          })
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { data?: SendResult } | null
        if (err.status === 207 && data?.data) {
          setSendResult(data.data)
          addToast('Announcement sent with some delivery issues', 'warning')
          const { data: sessionData } = await supabase.auth.getSession()
          const user = sessionData.session?.user
          if (user) {
            insertAuditLog({
              action_type: 'announcement_sent',
              actor_email: user.email ?? '',
              actor_id: user.id,
              target_member_id: null,
              target_member_name: null,
              details: { subject, recipient_count: data.data.sent },
            })
          }
        } else {
          setSendError(err.message)
          addToast('Failed to send announcement: ' + err.message, 'error')
        }
      } else {
        setSendError('Failed to send announcement')
        addToast('Failed to send announcement: An unexpected error occurred', 'error')
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
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col flex-1 bg-sbg-surface border border-white/[0.06] overflow-visible min-h-0">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center shrink-0">
            <span className="text-white text-sm font-bold font-mono">New Announcement</span>
          </div>

          <div className="px-5 py-2.5 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
            <span className="text-sm text-sbg-text-muted shrink-0 font-mono">To:</span>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {recipientType === 'all' && <Chip label="All Members" />}
              {recipientType === 'devteam' && <Chip label="DevTeam" />}
              {recipientType === 'pending' && <Chip label="Pending Applicants" />}
              {recipientType === 'group' && <Chip label="Skill Builder Department" />}
              {recipientType === 'individual' && (
                <InlineMemberSearch
                  selectedIds={selectedMemberIds}
                  selectedMembers={selectedMembers}
                  onToggle={toggleMember}
                />
              )}
            </div>
            <RecipientSwitcher value={recipientType} onChange={handleRecipientTypeChange} />
          </div>

          <div className="px-5 py-2.5 border-b border-white/[0.06] shrink-0 flex items-center gap-2">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-sbg-text-muted focus:outline-none"
            />
            <div className="relative shrink-0" ref={subjectDropdownRef}>
              <button
                type="button"
                onClick={() => setShowSubjectPresets(!showSubjectPresets)}
                className="inline-flex items-center gap-1 text-xs text-white hover:text-sbg-text-muted transition-colors"
              >
                Preset
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSubjectPresets && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-sbg-surface border border-white/[0.06] shadow-xl min-w-[220px]">
                  {SUBJECT_PRESETS.filter((p) => p.value).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSubject(preset.value)
                        setShowSubjectPresets(false)
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                    >
                      {preset.label}
                      <span className="block text-xs text-sbg-text-muted mt-0.5 font-mono">{preset.value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-auto">
            <textarea
              placeholder="Write your announcement..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                const el = e.target
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }}
              className="w-full px-5 py-4 bg-transparent text-sm text-white placeholder:text-sbg-text-muted focus:outline-none resize-none leading-relaxed"
              style={{ minHeight: '300px' }}
            />

            <div className="px-5 pb-4 shrink-0">
              <div className="border-t border-white/[0.06] pt-3">
                <input
                  type="text"
                  placeholder="Signature (e.g. — SBG Admin Team)"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full bg-transparent text-xs text-sbg-text-muted placeholder:text-sbg-text-muted/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {showTemplatePicker && (
            <div className="mx-5 mb-3 p-4 bg-white/[0.03] border border-white/[0.06] shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-sbg-text-muted font-mono">SELECT EMAIL TEMPLATE</span>
                <button
                  onClick={() => setShowTemplatePicker(false)}
                  className="text-sbg-text-muted hover:text-white transition-colors"
                  aria-label="Close template picker"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tmpl)
                      setShowTemplatePicker(false)
                    }}
                    className={[
                      'flex flex-col items-center gap-2 p-2 border transition-all text-center',
                      selectedTemplate.id === tmpl.id
                        ? 'border-white bg-white/10'
                        : 'border-white/[0.06] hover:border-white/20 hover:bg-white/5',
                    ].join(' ')}
                  >
                    {tmpl.thumbnail ? (
                      <div className="w-full aspect-[2/1] overflow-hidden bg-white/[0.03]">
                        <img
                          src={tmpl.thumbnail}
                          alt={tmpl.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/1] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <span className="text-xs text-sbg-text-muted">None</span>
                      </div>
                    )}
                    <span className="text-xs text-sbg-text-muted truncate w-full font-mono">
                      {tmpl.name}
                    </span>
                  </button>
                ))}
              </div>
              {selectedTemplate.headerUrl && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-sbg-text-muted mb-2">Preview:</p>
                  <div className="overflow-hidden border border-white/[0.06]">
                    <img src={selectedTemplate.headerUrl} alt="Header preview" className="w-full h-auto" />
                  </div>
                </div>
              )}
            </div>
          )}

          {!showTemplatePicker && selectedTemplate.id !== 'none' && (
            <div className="mx-5 mb-3 flex items-center gap-2 shrink-0">
              <Image className="w-3.5 h-3.5 text-white" />
              <span className="text-xs text-sbg-text-muted font-mono">
                Template: <span className="text-white">{selectedTemplate.name}</span>
              </span>
              <button
                onClick={() => setSelectedTemplate(EMAIL_TEMPLATES[0])}
                className="text-sbg-text-muted hover:text-red-400 transition-colors ml-1"
                aria-label="Remove template"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {sendResult && (
            <div className={[
              'mx-5 mb-3 p-3 border shrink-0',
              sendResult.failed.length > 0
                ? 'bg-yellow-900/20 border-yellow-700/40'
                : 'bg-green-900/20 border-green-700/50',
            ].join(' ')}>
              <p className="text-sm text-green-400 font-bold font-mono">
                Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? 's' : ''}
              </p>
              {sendResult.failed.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-red-400 font-mono">
                    {sendResult.failed.length} delivery failure{sendResult.failed.length !== 1 ? 's' : ''}
                  </p>
                  <ul className="flex flex-col gap-0.5 mt-1">
                    {sendResult.failed.map((f) => (
                      <li key={f.email} className="text-xs text-sbg-text-muted font-mono">
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
            <div className="mx-5 mb-3 p-3 bg-red-900/20 border border-red-700/40 shrink-0">
              <p className="text-sm text-red-400 font-mono">{sendError}</p>
            </div>
          )}

          <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.03] flex items-center gap-3 shrink-0">
            <Button
              icon={<Send className="w-4 h-4" />}
              loading={isSending}
              disabled={!canSend}
              onClick={handleSend}
              size="md"
            >
              Send
            </Button>
            <Button
              variant="ghost"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setShowPreview(true)}
              disabled={!subject && !body}
              size="md"
            >
              Preview
            </Button>
            <Button
              variant="ghost"
              icon={<Image className="w-4 h-4" />}
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              size="md"
            >
              Template
            </Button>

            {recipientType === 'individual' && selectedMembers.length === 0 && (
              <span className="text-xs text-sbg-text-muted ml-2 font-mono">
                Select at least one member
              </span>
            )}

            <div className="ml-auto">
              <button
                onClick={handleDiscard}
                className="text-sbg-text-muted hover:text-red-400 transition-colors p-2"
                aria-label="Discard"
                title="Discard draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
