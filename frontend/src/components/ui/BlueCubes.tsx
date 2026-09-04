/**
 * Decorative floating blue cubes for the background.
 * Fixed-position, non-interactive. Purely visual (SBG poster aesthetic).
 */

const CUBES = [
  { top: '12%', left: '6%', size: 46, rot: -12, dur: 8, delay: 0, opacity: 0.5 },
  { top: '22%', left: '88%', size: 30, rot: 18, dur: 6.5, delay: -1.2, opacity: 0.45 },
  { top: '55%', left: '3%', size: 22, rot: 8, dur: 7.5, delay: -2.4, opacity: 0.4 },
  { top: '68%', left: '92%', size: 40, rot: -20, dur: 9, delay: -0.8, opacity: 0.5 },
  { top: '80%', left: '14%', size: 28, rot: 14, dur: 7, delay: -3, opacity: 0.4 },
  { top: '40%', left: '95%', size: 16, rot: -6, dur: 6, delay: -1.8, opacity: 0.35 },
  { top: '88%', left: '60%', size: 20, rot: 22, dur: 8.5, delay: -2, opacity: 0.35 },
  { top: '8%', left: '48%', size: 18, rot: -10, dur: 7.2, delay: -0.5, opacity: 0.3 },
]

export function BlueCubes() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {CUBES.map((c, i) => (
        <div
          key={i}
          className="cube"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
            // custom props consumed by the cube-float keyframes
            ['--rot' as string]: `${c.rot}deg`,
            ['--dur' as string]: `${c.dur}s`,
            ['--delay' as string]: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
