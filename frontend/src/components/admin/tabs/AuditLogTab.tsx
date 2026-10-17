// frontend/src/components/admin/tabs/AuditLogTab.tsx
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { AuditLogEntry } from '../AuditLogEntry'
import { Pagination } from '../Pagination'
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

// The chapter is in PUP Biñan (PHT, UTC+8). Date-picker values are local PHT dates,
// so convert them to UTC bounds before querying the TIMESTAMPTZ created_at column.
// Without this, same-day PHT entries fall outside a UTC-midnight range.
function phtStartISO(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 8 * 60 * 60 * 1000).toISOString()
}

function phtEndISO(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - 8 * 60 * 60 * 1000).toISOString()
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
        query = query.gte('created_at', phtStartISO(startDate))
      }

      if (endDate) {
        query = query.lte('created_at', phtEndISO(endDate))
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
          <h1 className="font-sans text-white text-2xl font-bold">Audit Log</h1>
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
          <label className="text-xs text-sbg-text-muted font-mono">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm text-white bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-sbg-accent/40 focus:border-sbg-accent/40 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-sbg-text-muted font-mono">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm text-white bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-sbg-accent/40 focus:border-sbg-accent/40 transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="bg-sbg-surface border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
