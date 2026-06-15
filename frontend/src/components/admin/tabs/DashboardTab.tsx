// frontend/src/components/admin/tabs/DashboardTab.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, ToggleLeft, ToggleRight, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { PendingApplicantList } from '../PendingApplicantList'
import { BulkActionToolbar } from '../BulkActionToolbar'
import { ConfirmationModal } from '../../ui/ConfirmationModal'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { supabase } from '../../../lib/api'
import { insertAuditLog } from '../../../lib/auditLog'
import { getRegistrationOpen, setRegistrationOpen as setRegistrationOpenDB } from '../../../lib/appConfig'
import { useBulkAction } from '../../../lib/useBulkAction'
import { useToastStore } from '../../../store/toast'
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
  const addToast = useToastStore((state) => state.addToast)
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filterCourse, setFilterCourse] = useState('')
  const [sort, setSort] = useState('created_at_desc')
  const [registrationOpen, setRegistrationOpen] = useState<boolean>(true)
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [newSchoolYear, setNewSchoolYear] = useState('')
  const [newSemester, setNewSemester] = useState<'1st' | '2nd'>('1st')

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkConfirm, setShowBulkConfirm] = useState<{ action: 'approve' | 'reject' } | null>(null)

  // Build a memberNames map for audit logging
  const memberNames = useMemo(() => {
    const map = new Map<string, string>()
    members.forEach((m) => map.set(m.id, m.full_name))
    return map
  }, [members])

  const bulkAction = useBulkAction({
    action: showBulkConfirm?.action ?? 'approve',
    memberIds: selectedIds,
    memberNames,
    onComplete: () => {
      setSelectedIds([])
      void fetchPending(page)
    },
  })

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

  // Fetch registration open/closed status from DB on mount
  useEffect(() => {
    getRegistrationOpen().then(setRegistrationOpen)
  }, [])

  // Handle selection change from PendingApplicantList
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  // Handle bulk action confirmation
  async function handleBulkConfirm() {
    if (!showBulkConfirm) return
    const action = showBulkConfirm.action
    setShowBulkConfirm(null)

    const result = await bulkAction.execute()

    if (result.succeeded > 0) {
      addToast(
        `${result.succeeded} applicant${result.succeeded !== 1 ? 's' : ''} ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        'success'
      )
    }
    if (result.failed > 0) {
      addToast(
        `${result.failed} applicant${result.failed !== 1 ? 's' : ''} failed to ${action}`,
        'error'
      )
    }
  }

  async function toggleRegistration() {
    const next = !registrationOpen
    setIsTogglingRegistration(true)
    try {
      await setRegistrationOpenDB(next)
      setRegistrationOpen(next)
      addToast(next ? 'Registration window opened' : 'Registration window closed', 'success')
      // Audit log: registration toggled
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (user) {
        insertAuditLog({
          action_type: 'registration_toggled',
          actor_email: user.email ?? '',
          actor_id: user.id,
          target_member_id: null,
          target_member_name: null,
          details: { new_state: next ? 'open' : 'closed' },
        })
      }
    } catch (err) {
      console.error('Failed to toggle registration:', err)
      addToast('Failed to toggle registration', 'error')
    } finally {
      setIsTogglingRegistration(false)
    }
  }

  async function handleStartNewSemester() {
    if (!newSchoolYear.trim()) {
      addToast('Please enter a school year', 'error')
      return
    }
    setIsResetting(true)
    try {
      // 1. Deactivate current school year
      await supabase.from('SchoolYear').update({ is_active: false }).eq('is_active', true)

      // 2. Create new school year entry
      const termLabel = `${newSchoolYear.trim()} — ${newSemester} Sem`
      await supabase.from('SchoolYear').insert({
        school_year: newSchoolYear.trim(),
        semester: newSemester,
        is_active: true,
      })

      // 3. Mark all approved members as inactive
      await supabase.from('Member').update({ status: 'inactive' }).eq('status', 'approved')

      // 4. Open registration for the new term
      await setRegistrationOpenDB(true)
      setRegistrationOpen(true)

      setShowResetConfirm(false)
      addToast(`New semester started: ${termLabel}`, 'success')

      // Audit log
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (user) {
        insertAuditLog({
          action_type: 'term_reset',
          actor_email: user.email ?? '',
          actor_id: user.id,
          target_member_id: null,
          target_member_name: null,
          details: { school_year: newSchoolYear.trim(), semester: newSemester, label: termLabel },
        })
      }

      void fetchPending(1)
    } catch (err) {
      console.error('Failed to start new semester:', err)
      addToast('Failed to start new semester', 'error')
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
            disabled={isTogglingRegistration}
            className="flex-shrink-0 transition-colors disabled:opacity-50"
            aria-label={registrationOpen ? 'Close registration' : 'Open registration'}
          >
            {registrationOpen
              ? <ToggleRight className="w-10 h-10 text-green-400" />
              : <ToggleLeft className="w-10 h-10 text-sbg-text-muted" />
            }
          </button>
        </div>

        {/* Start New Semester */}
        <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-white text-sm font-bold">Start New Semester</p>
            <p className="text-sbg-text-muted text-xs mt-0.5">
              Begin a new term — marks all current members as inactive
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowResetConfirm(true)}
          >
            New Sem
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

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.length}
        onApprove={() => setShowBulkConfirm({ action: 'approve' })}
        onReject={() => setShowBulkConfirm({ action: 'reject' })}
        disabled={bulkAction.isRunning}
      />

      {/* Bulk operation progress */}
      {bulkAction.isRunning && (
        <div className="flex items-center gap-3 px-4 py-2 bg-sbg-navy-light border border-white/[0.08] rounded-[8px]">
          <div className="w-4 h-4 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-sbg-text">
            Processing {bulkAction.progress.completed} / {bulkAction.progress.total}...
          </span>
        </div>
      )}

      {/* Applicant List */}
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <PendingApplicantList
              members={members}
              onRefresh={() => fetchPending(page)}
              onSelectionChange={handleSelectionChange}
            />
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

      {/* Bulk Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkConfirm !== null}
        title={showBulkConfirm?.action === 'approve' ? 'Bulk Approve' : 'Bulk Reject'}
        message={`${showBulkConfirm?.action === 'approve' ? 'Approve' : 'Reject'} ${selectedIds.length} applicant${selectedIds.length !== 1 ? 's' : ''}?`}
        confirmLabel={showBulkConfirm?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={showBulkConfirm?.action === 'reject' ? 'danger' : 'default'}
        onConfirm={handleBulkConfirm}
        onCancel={() => setShowBulkConfirm(null)}
      />

      {/* Start New Semester Modal */}
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
              <div className="w-10 h-10 rounded-full bg-sbg-purple-muted border border-sbg-purple/30 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-sbg-purple" />
              </div>
              <div>
                <h3 className="font-mono text-white font-bold">Start New Semester</h3>
                <p className="text-sbg-text-muted text-xs mt-0.5">This will mark all current members as inactive</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="text-xs font-mono text-sbg-text-muted block mb-1.5">School Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={newSchoolYear}
                  onChange={(e) => setNewSchoolYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] text-sm text-white bg-sbg-navy-light border border-white/10 focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:border-sbg-purple placeholder:text-sbg-text-muted font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-sbg-text-muted block mb-1.5">Semester</label>
                <select
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value as '1st' | '2nd')}
                  className="w-full px-3 py-2 rounded-[8px] text-sm text-white bg-sbg-navy-light border border-white/10 focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:border-sbg-purple"
                >
                  <option value="1st" className="bg-sbg-navy-light">1st Semester</option>
                  <option value="2nd" className="bg-sbg-navy-light">2nd Semester</option>
                </select>
              </div>
            </div>

            <p className="text-sbg-text text-xs mb-4 leading-relaxed bg-red-900/10 border border-red-700/30 rounded-[8px] p-3">
              <span className="text-red-400 font-bold">Warning:</span> All currently approved members will be marked as inactive. Registration will open for the new semester. Members will need to re-register with an updated COR.
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
                variant="primary"
                className="flex-1"
                icon={<RotateCcw className="w-4 h-4" />}
                loading={isResetting}
                onClick={handleStartNewSemester}
                disabled={!newSchoolYear.trim()}
              >
                Start Semester
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
