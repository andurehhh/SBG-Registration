// frontend/src/components/admin/tabs/MembersTab.tsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, Download, RotateCcw } from 'lucide-react'
import { MembersTable } from '../MembersTable'
import { Pagination } from '../Pagination'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { supabase } from '../../../lib/api'
import { generateCsv, triggerDownload } from '../../../lib/csvExporter'
import { useBulkAction } from '../../../lib/useBulkAction'
import { useToastStore } from '../../../store/toast'
import type { Member, MemberStatus } from '../../../types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'approved_inactive', label: 'Approved + Inactive' },
  { value: 'approved', label: 'Approved' },
  { value: 'inactive', label: 'Inactive (Previous Term)' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'removed', label: 'Removed' },
]

const COURSE_OPTIONS = [
  { value: '', label: 'All Courses' },
  { value: 'BSIT', label: 'BS Information Technology' },
  { value: 'BSIE', label: 'BS Industrial Engineering' },
  { value: 'BSCE', label: 'BS Computer Engineering' },
]

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
  { value: 'year_level', label: 'By Year Level' },
]

const YEAR_LEVEL_OPTIONS = [
  { value: '', label: 'All Year Levels' },
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: '5', label: 'Ladderized' },
]

const PAGE_SIZE = 20

export function MembersTab() {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<MemberStatus | 'approved_inactive' | ''>('approved')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterYearLevel, setFilterYearLevel] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState('created_at_desc')
  const [search, setSearch] = useState('')
  const addToast = useToastStore((state) => state.addToast)

  const memberNames = useMemo(() => {
    const map = new Map<string, string>()
    members.forEach((m) => map.set(m.id, m.full_name))
    return map
  }, [members])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [members])

  const reinstatableIds = useMemo(() => {
    return Array.from(selectedIds).filter((id) => {
      const m = members.find((mem) => mem.id === id)
      return m && m.status === 'inactive'
    })
  }, [selectedIds, members])

  const bulkReinstate = useBulkAction({
    action: 'reinstate',
    memberIds: reinstatableIds,
    memberNames,
    onComplete: () => {
      setSelectedIds(new Set())
      void fetchMembers(page)
    },
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchMembers = useCallback(async (p = 1) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('Member')
        .select('*', { count: 'exact' })

      if (filterStatus === 'approved_inactive') {
        query = query.in('status', ['approved', 'inactive'])
      } else if (filterStatus) {
        query = query.eq('status', filterStatus)
      }
      if (filterCourse) query = query.eq('course', filterCourse)
      if (filterYearLevel) query = query.eq('year_level', filterYearLevel)

      if (search) {
        const term = `%${search.trim()}%`
        query = query.or(`full_name.ilike.${term},student_number.ilike.${term},sbg_id.ilike.${term}`)
      }

      const orderMap: Record<string, { col: string; asc: boolean }> = {
        created_at_desc: { col: 'created_at', asc: false },
        created_at_asc: { col: 'created_at', asc: true },
        status: { col: 'status', asc: true },
        year_level: { col: 'year_level', asc: true },
      }
      const order = orderMap[sort] ?? { col: 'created_at', asc: false }
      query = query.order(order.col, { ascending: order.asc })

      const from = (p - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count } = await query
      setMembers(data ?? [])
      setTotal(count ?? 0)
      setPage(p)
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, filterCourse, filterYearLevel, sort])

  useEffect(() => { void fetchMembers(1) }, [fetchMembers])

  async function handleBulkReinstate() {
    if (reinstatableIds.length === 0) return
    const result = await bulkReinstate.execute()
    if (result.succeeded > 0) {
      addToast(`${result.succeeded} member${result.succeeded !== 1 ? 's' : ''} reinstated`, 'success')
    }
    if (result.failed > 0) {
      addToast(`${result.failed} member${result.failed !== 1 ? 's' : ''} failed to reinstate`, 'error')
    }
  }

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true)
    try {
      let query = supabase
        .from('Member')
        .select('*')

      if (filterStatus === 'approved_inactive') {
        query = query.in('status', ['approved', 'inactive'])
      } else if (filterStatus) {
        query = query.eq('status', filterStatus)
      }
      if (filterCourse) query = query.eq('course', filterCourse)

      if (search) {
        const term = `%${search.trim()}%`
        query = query.or(`full_name.ilike.${term},student_number.ilike.${term},sbg_id.ilike.${term}`)
      }

      const orderMap: Record<string, { col: string; asc: boolean }> = {
        created_at_desc: { col: 'created_at', asc: false },
        created_at_asc: { col: 'created_at', asc: true },
        status: { col: 'status', asc: true },
        year_level: { col: 'year_level', asc: true },
      }
      const order = orderMap[sort] ?? { col: 'created_at', asc: false }
      query = query.order(order.col, { ascending: order.asc })

      // Fetch all matching members in pages (no silent truncation at 9999).
      const buildMembersQuery = (from: number, to: number) => {
        let q = supabase.from('Member').select('*')
        if (filterStatus === 'approved_inactive') {
          q = q.in('status', ['approved', 'inactive'])
        } else if (filterStatus) {
          q = q.eq('status', filterStatus)
        }
        if (filterCourse) {
          q = q.eq('course', filterCourse)
        }
        if (filterYearLevel) {
          q = q.eq('year_level', filterYearLevel)
        }
        if (search) {
          const term = `%${search.trim()}%`
          q = q.or(`full_name.ilike.${term},student_number.ilike.${term},sbg_id.ilike.${term}`)
        }
        const ordered = orderMap[sort] ?? { col: 'created_at', asc: false }
        return q.order(ordered.col, { ascending: ordered.asc }).range(from, to)
      }

      const allMembers: any[] = []
      let offset = 0
      const fetchPage = 50
      for (;;) {
        const { data, error } = await buildMembersQuery(offset, offset + fetchPage - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        allMembers.push(...data)
        if (data.length < fetchPage) break
        offset += fetchPage
      }

      const data = allMembers
      if (!data || data.length === 0) {
        addToast('No members to export', 'info')
        return
      }

      const csv = generateCsv(data as Member[])
      const today = new Date().toISOString().split('T')[0]
      triggerDownload(csv, `sbg-members-${today}.csv`)
    } catch {
      addToast('Failed to export members', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [filterStatus, filterCourse, filterYearLevel, sort, addToast])

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-white text-2xl font-bold">Members</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {isLoading ? 'Loading...' : `${total} member${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
            loading={isExporting}
            disabled={isExporting || isLoading}
          >
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchMembers(page)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk reinstate toolbar */}
      {reinstatableIds.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 bg-sbg-surface border border-white/[0.06] mb-4">
          <span className="text-sm text-white font-mono">
            {reinstatableIds.length} inactive member{reinstatableIds.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            size="sm"
            variant="primary"
            icon={<RotateCcw className="w-4 h-4" />}
            disabled={bulkReinstate.isRunning}
            onClick={handleBulkReinstate}
          >
            Reinstate Selected
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="w-52">
          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as MemberStatus | 'approved_inactive' | ''); setPage(1) }}
          />
        </div>
        <div className="w-52">
          <Select
            options={COURSE_OPTIONS}
            value={filterCourse}
            onChange={(e) => { setFilterCourse(e.target.value); setPage(1) }}
          />
        </div>
        <div className="w-48">
          <Select
            options={YEAR_LEVEL_OPTIONS}
            value={filterYearLevel}
            onChange={(e) => { setFilterYearLevel(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search name, student number, or SBG ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full px-3 py-2 text-sm text-white bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-sbg-accent/40 focus:border-sbg-accent/40 transition-colors placeholder:text-sbg-text-muted"
          />
        </div>
        <div className="w-44">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-sbg-surface border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MembersTable members={members} selectedIds={selectedIds} onSelectionChange={(ids) => setSelectedIds(new Set(ids))} onChanged={() => fetchMembers(page)} />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={(p) => fetchMembers(p)}
            />
          </>
        )}
      </div>
    </div>
  )
}
