/**
 * Decorative "blue technical blueprint" background accents.
 * Fixed-position, non-interactive, purely visual and kept subordinate to the form.
 *
 * - Floating blue cubes drift very gently (disabled under prefers-reduced-motion via CSS).
 * - Stepped geometric brackets are anchored to the top-right / bottom-left edges.
 * - Extra shapes are hidden below the `sm` breakpoint to reduce clutter on phones.
 */

// Kept fewer + calmer than before so the background never competes with the form.
const CUBES = [
  { top: '14%', left: '5%', size: 40, rot: -12, dur: 9, delay: 0, opacity: 0.42, sm: true },
  { top: '24%', left: '90%', size: 26, rot: 16, dur: 8, delay: -1.4, opacity: 0.38, sm: false },
  { top: '66%', left: '3%', size: 22, rot: 8, dur: 8.5, delay: -2.4, opacity: 0.34, sm: false },
  { top: '72%', left: '93%', size: 34, rot: -18, dur: 10, delay: -0.8, opacity: 0.4, sm: true },
  { top: '88%', left: '18%', size: 20, rot: 12, dur: 8, delay: -3, opacity: 0.3, sm: false },
]

// Stepped geometric brackets anchored to opposite corners (blueprint motif).
const STEPS = [
  { top: '9%', right: '4%', size: 130, rot: 0, sm: false },
  { bottom: '8%', left: '2%', size: 150, rot: 180, sm: true },
]

export function BlueCubes() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {STEPS.map((s, i) => (
        <div
          key={`step-${i}`}
          className={`step-shape ${s.sm ? '' : 'hidden sm:block'}`}
          style={{
            top: s.top,
            bottom: s.bottom,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            transform: `rotate(${s.rot}deg)`,
          }}
        />
      ))}

      {CUBES.map((c, i) => (
        <div
          key={`cube-${i}`}
          className={`cube ${c.sm ? '' : 'hidden sm:block'}`}
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
