// frontend/src/components/registration/ProgressBar.tsx
interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-sbg-text-muted text-center font-mono">
        Step {current} of {total}
      </p>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              background: i < current ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
