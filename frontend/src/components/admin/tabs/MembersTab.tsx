// frontend/src/components/admin/tabs/MembersTab.tsx
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { MembersTable } from '../MembersTable'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { supabase } from '../../../lib/api'
import type { Member, MemberStatus } from '../../../types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'inactive', label: 'Inactive (Previous Term)' },
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

const PAGE_SIZE = 20

function Pagination({
  page, totalPages, total, pageSize, onPage,
}: {
  page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void
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

export function MembersTab() {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<MemberStatus | ''>('approved')
  const [filterCourse, setFilterCourse] = useState('')
  const [sort, setSort] = useState('created_at_desc')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchMembers = useCallback(async (p = 1) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('Member')
        .select('*', { count: 'exact' })

      const statusFilter = filterStatus || 'approved'
      query = query.eq('status', statusFilter)
      if (filterCourse) query = query.eq('course', filterCourse)

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
  }, [filterStatus, filterCourse, sort])

  useEffect(() => { void fetchMembers(1) }, [fetchMembers])

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-white text-2xl font-bold">Members</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {isLoading ? 'Loading...' : `${total} member${total !== 1 ? 's' : ''}`}
          </p>
        </div>
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="w-52">
          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as MemberStatus | ''); setPage(1) }}
          />
        </div>
        <div className="w-52">
          <Select
            options={COURSE_OPTIONS}
            value={filterCourse}
            onChange={(e) => { setFilterCourse(e.target.value); setPage(1) }}
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
      <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sbg-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <MembersTable members={members} />
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
