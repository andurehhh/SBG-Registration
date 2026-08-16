// frontend/src/components/admin/Charts.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PIE_COLORS = [
  '#ffffff',
  '#22C55E',
  '#FF9900',
  '#8B5CF6',
  '#16A34A',
  '#F59E0B',
  '#A78BFA',
  '#4ADE80',
]

const DEFAULT_BAR_COLOR = '#ffffff'

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#111111',
  border: '1px solid rgba(255,255,255,0.06)',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '12px',
  color: '#e0e0e0',
}

interface ChartData {
  name: string
  value: number
}

interface BarChartCardProps {
  title: string
  data: ChartData[]
  color?: string
}

export function BarChartCard({ title, data, color = DEFAULT_BAR_COLOR }: BarChartCardProps) {
  return (
    <div className="bg-sbg-surface border border-white/[0.06] p-5">
      <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-4 font-mono">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#888888', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#888888', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            itemStyle={{ color: '#e0e0e0' }}
            labelStyle={{ color: '#888888' }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface PieChartCardProps {
  title: string
  data: ChartData[]
}

export function PieChartCard({ title, data }: PieChartCardProps) {
  return (
    <div className="bg-sbg-surface border border-white/[0.06] p-5">
      <h3 className="text-sbg-text-muted text-xs uppercase tracking-wider mb-4 font-mono">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            itemStyle={{ color: '#e0e0e0' }}
            labelStyle={{ color: '#888888' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#888888', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
