// frontend/src/components/admin/tabs/DataVizTab.tsx
import { useState, useEffect } from 'react'
import { Users, UserCheck, Clock, UserX, RefreshCw } from 'lucide-react'
import { BarChartCard, PieChartCard } from '../Charts'
import { Button } from '../../ui/Button'
import { supabase } from '../../../lib/api'
import type { DashboardStats } from '../../../types'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent?: string
  bg?: string
}

function StatCard({ label, value, icon, accent = 'text-white', bg = 'bg-white/5 border-white/10' }: StatCardProps) {
  return (
    <div className="bg-sbg-surface border border-white/[0.06] p-5 flex items-center gap-4">
      <div className={`w-10 h-10 border flex items-center justify-center shrink-0 ${bg}`}>
        <span className={accent}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-sbg-text-muted uppercase tracking-wider truncate font-mono">{label}</p>
        <p className="text-white text-2xl font-bold leading-tight font-mono">{value}</p>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-sbg-surface border border-white/[0.06] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 bg-white/5 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-7 bg-white/5 rounded w-16" />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-sbg-surface border border-white/[0.06] p-5 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-32 mb-4" />
      <div className="h-[220px] bg-white/5 rounded" />
    </div>
  )
}

export function DataVizTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [schoolYears, setSchoolYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')

  useEffect(() => {
    supabase
      .from('Member')
      .select('school_year')
      .not('school_year', 'is', null)
      .then(({ data }) => {
        const years = [...new Set((data ?? []).map((r) => r.school_year as string))].sort().reverse()
        setSchoolYears(years)
        if (years.length > 0) setSelectedYear(years[0])
      })
  }, [])

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const termWhere = selectedYear ? { school_year: selectedYear } : {}

    Promise.all([
      supabase.from('Member').select('status').match(termWhere),
      supabase.from('Member').select('course').match(termWhere).in('status', ['approved', 'inactive']).not('course', 'is', null),
      supabase.from('Member').select('year_level').match(termWhere).in('status', ['approved', 'inactive']),
      supabase.from('Member').select('gender').match(termWhere).in('status', ['approved', 'inactive']).not('gender', 'is', null),
    ]).then(([statusRes, courseRes, yearRes, genderRes]) => {
      const statusMap: Record<string, number> = {}
      for (const row of statusRes.data ?? []) {
        statusMap[row.status] = (statusMap[row.status] ?? 0) + 1
      }

      const courseMap: Record<string, number> = {}
      for (const row of courseRes.data ?? []) {
        courseMap[row.course] = (courseMap[row.course] ?? 0) + 1
      }

      const yearMap: Record<number, number> = {}
      for (const row of yearRes.data ?? []) {
        yearMap[row.year_level] = (yearMap[row.year_level] ?? 0) + 1
      }

      const genderMap: Record<string, number> = {}
      for (const row of genderRes.data ?? []) {
        genderMap[row.gender] = (genderMap[row.gender] ?? 0) + 1
      }

      setStats({
        total: (statusRes.data ?? []).length,
        pending: statusMap['pending'] ?? 0,
        approved: statusMap['approved'] ?? 0,
        rejected: statusMap['rejected'] ?? 0,
        inactive: statusMap['inactive'] ?? 0,
        removed: statusMap['removed'] ?? 0,
        byCourse: Object.entries(courseMap).map(([course, count]) => ({ course, count })),
        byYearLevel: Object.entries(yearMap).map(([year, count]) => ({ year: Number(year), count })),
        byGender: Object.entries(genderMap).map(([gender, count]) => ({ gender, count })),
        bySkill: [],
      })
    }).catch(() => setError('Failed to load statistics.'))
      .finally(() => setIsLoading(false))
  }, [selectedYear])

  const acceptedVsRejectedData = stats
    ? [
        { name: 'Approved', value: stats.approved },
        { name: 'Rejected', value: stats.rejected },
        { name: 'Inactive', value: stats.inactive },
      ].filter((d) => d.value > 0)
    : []

  const courseData = stats?.byCourse.map((d) => ({ name: d.course, value: d.count })) ?? []
  const yearData = stats?.byYearLevel.map((d) => ({ name: `Year ${d.year}`, value: d.count })) ?? []
  const genderData = stats?.byGender.map((d) => ({ name: d.gender, value: d.count })) ?? []

  const yearOptions = [
    { value: '', label: 'All Time' },
    ...schoolYears.map((y) => ({ value: y, label: y })),
  ]

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sans text-white text-2xl font-bold">Data Visualization</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {selectedYear ? `School Year ${selectedYear}` : 'All-time membership statistics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-sbg-text-muted whitespace-nowrap font-mono">School Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.06] text-white text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sbg-accent/40 focus:border-sbg-accent/40 appearance-none cursor-pointer"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-sbg-surface">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => setSelectedYear((y) => y)}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
          </div>
        </>
      ) : error ? (
        <div className="bg-sbg-surface border border-white/[0.06] p-8 text-center">
          <p className="text-sbg-text-muted text-sm font-mono">{error}</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Users className="w-5 h-5" />}
              accent="text-white"
              bg="bg-white/5 border-white/10"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={<UserCheck className="w-5 h-5" />}
              accent="text-green-400"
              bg="bg-green-900/20 border-green-700/30"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={<Clock className="w-5 h-5" />}
              accent="text-yellow-400"
              bg="bg-yellow-900/20 border-yellow-700/30"
            />
            <StatCard
              label="Inactive"
              value={stats.inactive}
              icon={<UserX className="w-5 h-5" />}
              accent="text-sbg-text-muted"
              bg="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedVsRejectedData.length > 0 && (
              <PieChartCard
                title={`Application Outcomes${selectedYear ? ` — ${selectedYear}` : ''}`}
                data={acceptedVsRejectedData}
              />
            )}
            {courseData.length > 0 && (
              <BarChartCard
                title={`Members by Course${selectedYear ? ` — ${selectedYear}` : ''}`}
                data={courseData}
                color="#22C55E"
              />
            )}
            {yearData.length > 0 && (
              <BarChartCard
                title={`Members by Year Level${selectedYear ? ` — ${selectedYear}` : ''}`}
                data={yearData}
                color="#FF9900"
              />
            )}
            {genderData.length > 0 && (
              <PieChartCard
                title={`Members by Gender${selectedYear ? ` — ${selectedYear}` : ''}`}
                data={genderData}
              />
            )}
            {courseData.length === 0 && yearData.length === 0 && genderData.length === 0 && (
              <div className="col-span-2 bg-sbg-surface border border-white/[0.06] p-8 text-center">
                <p className="text-sbg-text-muted text-sm font-mono">
                  No approved member data for {selectedYear || 'this period'}.
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
