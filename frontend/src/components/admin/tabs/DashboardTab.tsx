// frontend/src/components/admin/tabs/DashboardTab.tsx
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ToggleLeft, ToggleRight, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { PendingApplicantList } from '../PendingApplicantList'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { supabase, edgeFn } from '../../../lib/api'
import type { Member } from '../../../types'

const COURSE_OPTIONS = [
  { value: '', label: 'All Courses' },
  { value: 'BSIT', label: 'BS Information Technology' },
  { value: 'BSIE', label: 'BS Industrial Engineering' },
  { value: 'BSCE', label: 'BS Computer Engineering' },
]

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
]

const STORAGE_KEY = 'sbg_registration_open'
const TERM_RESET_KEY = 'sbg_term_reset_pending'
const PAGE_SIZE = 15

function Pagination({ page, totalPages, total, pageSize, onPage }: {
  page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.08]">
      <p className="text-xs font-mono text-sbg-text-muted">{from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
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
            <button key={p} onClick={() => onPage(p)}
              className={['w-7 h-7 rounded-[8px] text-xs font-mono transition-colors',
                p === page ? 'bg-sbg-purple text-white' : 'text-sbg-text-muted hover:text-white hover:bg-white/5'].join(' ')}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="p-1.5 rounded-[8px] text-sbg-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function DashboardTab() {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filterCourse, setFilterCourse] = useState('')
  const [sort, setSort] = useState('created_at_desc')
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  })
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchPending = useCallback(async (p = 1) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('Member')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')

      if (filterCourse) query = query.eq('course', filterCourse)
      query = sort === 'created_at_asc' ? query.order('created_at', { ascending: true }) : query.order('created_at', { ascending: false })

      const from = (p - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count } = await query
      setMembers(data ?? [])
      setTotal(count ?? 0)
      setPage(p)
    } finally {
      setIsLoading(false)
    }
  }, [filterCourse, sort])

  useEffect(() => { void fetchPending(1) }, [fetchPending])

  function toggleRegistration() {
    const next = !registrationOpen
    setRegistrationOpen(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: String(next),
    }))
  }

  async function handleTermReset() {
    setIsResetting(true)
    try {
      await edgeFn.post('term-reset', {})
      setShowResetConfirm(false)
      localStorage.setItem(TERM_RESET_KEY, new Date().toISOString())
      void fetchPending(1)
    } catch {
      setShowResetConfirm(false)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-mono text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {isLoading ? 'Loading...' : `${total} pending application${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchPending(page)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Registration window toggle */}
        <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-white text-sm font-bold">Registration Window</p>
            <p className="text-sbg-text-muted text-xs mt-0.5">
              {registrationOpen ? 'Open — students can submit applications' : 'Closed — registration form is disabled'}
            </p>
          </div>
          <button
            onClick={toggleRegistration}
            className="flex-shrink-0 transition-colors"
            aria-label={registrationOpen ? 'Close registration' : 'Open registration'}
          >
            {registrationOpen
              ? <ToggleRight className="w-10 h-10 text-green-400" />
              : <ToggleLeft className="w-10 h-10 text-sbg-text-muted" />
            }
          </button>
        </div>

        {/* School term reset */}
        <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-white text-sm font-bold">End School Term</p>
            <p className="text-sbg-text-muted text-xs mt-0.5">
              Mark all approved members as inactive and require re-registration
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowResetConfirm(true)}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="w-48">
          <Select options={COURSE_OPTIONS} value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} />
        </div>
        <div className="w-40">
          <Select options={SORT_OPTIONS} value={sort} onChange={(e) => setSort(e.target.value)} />
        </div>
      </div>

      {/* Applicant List */}
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <PendingApplicantList members={members} onRefresh={() => fetchPending(page)} />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={(p) => fetchPending(p)}
            />
          </>
        )}
      </div>

      {/* Term Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => !isResetting && setShowResetConfirm(false)}
        >
          <div
            className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-mono text-white font-bold">End School Term?</h3>
                <p className="text-sbg-text-muted text-xs mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sbg-text text-sm mb-6 leading-relaxed">
              This will mark <span className="text-white font-medium">all approved members</span> as inactive and close the registration window. Members will need to re-register for the new term.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                icon={<RotateCcw className="w-4 h-4" />}
                loading={isResetting}
                onClick={handleTermReset}
              >
                End Term
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
