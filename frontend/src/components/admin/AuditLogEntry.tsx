// frontend/src/components/admin/AuditLogEntry.tsx
import {
  CheckCircle,
  XCircle,
  Megaphone,
  ToggleRight,
  RotateCcw,
} from 'lucide-react'
import type { AuditLogEntry as AuditLogEntryType, AuditActionType } from '../../types'

interface AuditLogEntryProps {
  entry: AuditLogEntryType
}

// ─── Badge config per action type ─────────────────────────────────────────────

interface BadgeConfig {
  label: string
  icon: React.ReactNode
  classes: string
}

const BADGE_CONFIG: Record<AuditActionType, BadgeConfig> = {
  approve: {
    label: 'Approved',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    classes: 'bg-green-900/50 text-green-400 border-green-700/50',
  },
  reject: {
    label: 'Rejected',
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: 'bg-red-900/50 text-red-400 border-red-700/50',
  },
  bulk_approve: {
    label: 'Bulk Approved',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    classes: 'bg-green-900/50 text-green-400 border-green-700/50',
  },
  bulk_reject: {
    label: 'Bulk Rejected',
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: 'bg-red-900/50 text-red-400 border-red-700/50',
  },
  announcement_sent: {
    label: 'Announcement',
    icon: <Megaphone className="w-3.5 h-3.5" />,
    classes: 'bg-blue-900/50 text-blue-400 border-blue-700/50',
  },
  registration_toggled: {
    label: 'Registration Toggled',
    icon: <ToggleRight className="w-3.5 h-3.5" />,
    classes: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
  },
  term_reset: {
    label: 'Term Reset',
    icon: <RotateCcw className="w-3.5 h-3.5" />,
    classes: 'bg-purple-900/50 text-purple-400 border-purple-700/50',
  },
}

// ─── Relative time formatter ──────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

  // Fallback to absolute format for older entries
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Details summary helper ───────────────────────────────────────────────────

function getDetailsSummary(details: Record<string, unknown> | null): string | null {
  if (!details) return null

  // Show count if present (bulk operations)
  if ('count' in details && typeof details.count === 'number') {
    return `${details.count} member${details.count !== 1 ? 's' : ''}`
  }

  // Show subject for announcements
  if ('subject' in details && typeof details.subject === 'string') {
    const subject = details.subject
    const recipientCount = 'recipient_count' in details ? ` → ${details.recipient_count} recipients` : ''
    return `"${subject.length > 40 ? subject.slice(0, 40) + '…' : subject}"${recipientCount}`
  }

  // Show new_state for registration toggle
  if ('new_state' in details && typeof details.new_state === 'string') {
    return `Set to ${details.new_state}`
  }

  // Generic: show first key-value pair
  const entries = Object.entries(details)
  if (entries.length > 0) {
    const [key, value] = entries[0]
    return `${key}: ${String(value)}`
  }

  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuditLogEntry({ entry }: AuditLogEntryProps) {
  const badge = BADGE_CONFIG[entry.action_type]
  const detailsSummary = getDetailsSummary(entry.details)

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {/* Icon */}
      <div className="mt-0.5 shrink-0">{badge.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action badge */}
          <span
            className={[
              'inline-flex items-center px-2 py-0.5 rounded-[4px]',
              'text-xs font-mono border',
              badge.classes,
            ].join(' ')}
          >
            {badge.label}
          </span>

          {/* Target member name */}
          {entry.target_member_name && (
            <span className="text-sm text-white font-medium truncate">
              {entry.target_member_name}
            </span>
          )}
        </div>

        {/* Actor and details row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs font-mono text-sbg-text-muted">
            by {entry.actor_email}
          </span>
          {detailsSummary && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-xs text-sbg-text-muted truncate">
                {detailsSummary}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <span className="text-xs font-mono text-sbg-text-muted shrink-0 mt-0.5">
        {formatRelativeTime(entry.created_at)}
      </span>
    </div>
  )
}
