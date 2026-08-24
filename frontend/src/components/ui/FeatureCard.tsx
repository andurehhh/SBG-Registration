interface FeatureCardProps {
  icon: string
  title: string
  desc: string
  color: string
}

export function FeatureCard({ icon, title, desc, color }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 h-full transition-shadow hover:shadow-md" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-3 pb-3 mb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color }}>{title}</h3>
        <img src={icon} alt="" className="w-7 h-7 shrink-0" />
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  )
}