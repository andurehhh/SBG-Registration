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

// Purple, green, orange palette — varied so charts aren't all violet
const PIE_COLORS = [
  '#7C3AED', // sbg-purple
  '#22C55E', // green-500
  '#FF9900', // sbg-orange / AWS orange
  '#8B5CF6', // purple-500
  '#16A34A', // green-600
  '#F59E0B', // amber-400
  '#A78BFA', // purple-400
  '#4ADE80', // green-400
]

// Bar chart uses a single color per chart — passed as prop
const DEFAULT_BAR_COLOR = '#7C3AED'

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: '#252b3b',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  fontFamily: 'Space Mono, monospace',
  fontSize: '12px',
  color: '#ffffff',
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
    <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-5">
      <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Space Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Space Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            itemStyle={{ color: '#ffffff' }}
            labelStyle={{ color: '#94A3B8' }}
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
    <div className="bg-sbg-navy border border-white/[0.08] rounded-[8px] p-5">
      <h3 className="font-mono text-sbg-text-muted text-xs uppercase tracking-wider mb-4">
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
            itemStyle={{ color: '#ffffff' }}
            labelStyle={{ color: '#94A3B8' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#94A3B8', fontFamily: 'Space Mono, monospace', fontSize: '11px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
