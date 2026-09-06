// frontend/src/components/registration/ProgressBar.tsx
interface ProgressBarProps {
  current: number
  total: number
  steps?: string[]
}

const DEFAULT_STEPS = ['Personal Information', 'Application Questions', 'Attachments']

export function ProgressBar({ current, total, steps = DEFAULT_STEPS }: ProgressBarProps) {
  const labels = steps.slice(0, total)

  return (
    <nav aria-label="Registration progress" className="flex flex-col gap-2">
      {/* Screen-reader announcement of current position */}
      <p className="sr-only" aria-live="polite">
        Step {current} of {total}: {labels[current - 1]}
      </p>

      {/* Visible step labels */}
      <ol className="flex items-center gap-1" role="list">
        {labels.map((label, i) => {
          const stepNum = i + 1
          const state =
            stepNum < current ? 'completed' : stepNum === current ? 'current' : 'upcoming'
          return (
            <li key={label} className="flex-1 flex flex-col gap-1.5" aria-current={state === 'current' ? 'step' : undefined}>
              <div
                aria-hidden="true"
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background:
                    state === 'completed'
                      ? 'var(--accent)'
                      : state === 'current'
                      ? 'var(--accent-bright, var(--accent))'
                      : 'var(--border)',
                  transition: 'background 0.3s',
                }}
              />
              <span
                className="text-[10px] sm:text-[11px] leading-tight text-center"
                style={{
                  color: state === 'upcoming' ? 'var(--text-secondary)' : 'var(--text)',
                  fontWeight: state === 'current' ? 700 : 500,
                }}
              >
                <span className="sr-only">
                  {state === 'completed' ? 'Completed: ' : state === 'current' ? 'Current step: ' : 'Upcoming: '}
                </span>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
