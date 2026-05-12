// frontend/src/components/registration/ProgressBar.tsx
interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-mono text-sbg-text-muted text-center">
        Step {current} of {total}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={[
              'flex-1 h-1 rounded-full transition-colors duration-300',
              i < current ? 'bg-sbg-purple' : 'bg-sbg-navy-light',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
