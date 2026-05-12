// frontend/src/components/admin/tabs/DataVizTab.tsx
import { useState, useEffect } from 'react'
import { Users, UserCheck, Clock, UserX, RefreshCw } from 'lucide-react'
import { BarChartCard, PieChartCard } from '../Charts'
import { Button } from '../../ui/Button'
import { api } from '../../../lib/api'
import type { DashboardStats } from '../../../types'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent?: string
  bg?: string
}

function StatCard({ label, value, icon, accent = 'text-sbg-purple', bg = 'bg-sbg-purple/10 border-sbg-purple/30' }: StatCardProps) {
  return (
    <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${bg}`}>
        <span className={accent}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-mono text-sbg-text-muted uppercase tracking-wider truncate">{label}</p>
        <p className="font-mono text-white text-2xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-7 bg-white/5 rounded w-16" />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-5 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-32 mb-4" />
      <div className="h-[220px] bg-white/5 rounded" />
    </div>
  )
}

export function DataVizTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // School year filter
  const [schoolYears, setSchoolYears] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('') // '' = all time

  // Fetch available school years on mount
  useEffect(() => {
    api.get<string[]>('/api/admin/stats/school-years')
      .then((res) => {
        if (res.success) {
          setSchoolYears(res.data)
          // Default to the most recent term
          if (res.data.length > 0) setSelectedYear(res.data[0])
        }
      })
      .catch(() => {/* silently ignore */})
  }, [])

  // Fetch stats whenever selected year changes
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    const url = selectedYear
      ? `/api/admin/stats?school_year=${encodeURIComponent(selectedYear)}`
      : '/api/admin/stats'
    api
      .get<DashboardStats>(url)
      .then((result) => {
        if (result.success) {
          setStats(result.data)
        } else {
          setError('Failed to load statistics.')
        }
      })
      .catch(() => setError('Failed to load statistics.'))
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-mono text-white text-2xl font-bold">Data Visualization</h1>
          <p className="text-sbg-text-muted text-sm mt-1">
            {selectedYear ? `School Year ${selectedYear}` : 'All-time membership statistics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* School year selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-sbg-text-muted whitespace-nowrap">School Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-sbg-navy-light border border-white/10 text-white text-sm font-mono rounded-[8px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sbg-purple focus:border-sbg-purple appearance-none cursor-pointer"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-sbg-navy-light">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => setSelectedYear((y) => y)} // re-trigger effect
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary Row */}
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
        <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-8 text-center">
          <p className="font-mono text-sbg-text-muted text-sm">{error}</p>
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total"
              value={stats.total}
              icon={<Users className="w-5 h-5" />}
              accent="text-sbg-purple"
              bg="bg-sbg-purple/10 border-sbg-purple/30"
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

          {/* Charts */}
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
              <div className="col-span-2 bg-sbg-navy border border-white/[0.08] rounded-[8px] p-8 text-center">
                <p className="font-mono text-sbg-text-muted text-sm">
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
