// frontend/src/components/admin/tabs/AuditLogTab.tsx
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { AuditLogEntry } from '../AuditLogEntry'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { supabase } from '../../../lib/api'
import { useToastStore } from '../../../store/toast'
import type { AuditLogEntry as AuditLogEntryType, AuditActionType } from '../../../types'

const ACTION_TYPE_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'approve', label: 'Approved' },
  { value: 'reject', label: 'Rejected' },
  { value: 'bulk_approve', label: 'Bulk Approved' },
  { value: 'bulk_reject', label: 'Bulk Rejected' },
  { value: 'announcement_sent', label: 'Announcement Sent' },
  { value: 'registration_toggled', label: 'Registration Toggled' },
  { value: 'term_reset', label: 'Term Reset' },
]

const PAGE_SIZE = 25

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.08]">
      <p className="text-xs font-mono text-sbg-text-muted">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p = i + 1
          if (totalPages > 5) {
            if (page <= 3) p = i + 1
            else if (page >= totalPages - 2) p = totalPages - 4 + i
            else p = page - 2 + i
          }
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={[
                'w-7 h-7 rounded-[8px] text-xs font-mono transition-colors',
                p === page
                  ? 'bg-sbg-purple text-white'
                  : 'text-sbg-text-muted hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function AuditLogTab() {
  const [entries, setEntries] = useState<AuditLogEntryType[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filterActionType, setFilterActionType] = useState<AuditActionType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const addToast = useToastStore((s) => s.addToast)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchEntries = useCallback(async (p = 1) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('AuditLog')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filterActionType) {
        query = query.eq('action_type', filterActionType)
      }

      if (startDate) {
        query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      }

      if (endDate) {
        query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
      }

      const from = (p - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count, error } = await query

      if (error) {
        throw error
      }

      setEntries(data ?? [])
      setTotal(count ?? 0)
      setPage(p)
    } catch (err) {
      console.error('Failed to fetch audit log:', err)
      addToast('Failed to load audit log', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [filterActionType, startDate, endDate, addToast])

  useEffect(() => { void fetchEntries(1) }, [fetchEntries])

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-white text-2xl font-bold">Audit Log</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {isLoading ? 'Loading...' : `${total} entr${total !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={() => fetchEntries(page)}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="w-52">
          <Select
            options={ACTION_TYPE_OPTIONS}
            value={filterActionType}
            onChange={(e) => { setFilterActionType(e.target.value as AuditActionType | ''); setPage(1) }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-mono text-sbg-text-muted">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-[8px] text-sm text-white bg-sbg-navy-light border border-white/10 focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0 focus:border-sbg-purple transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-mono text-sbg-text-muted">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-[8px] text-sm text-white bg-sbg-navy-light border border-white/10 focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:ring-offset-0 focus:border-sbg-purple transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sbg-text-muted text-sm font-mono">No audit log entries found</p>
            <p className="text-sbg-text-muted text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/[0.04]">
              {entries.map((entry) => (
                <AuditLogEntry key={entry.id} entry={entry} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={(p) => fetchEntries(p)}
            />
          </>
        )}
      </div>
    </div>
  )
}
