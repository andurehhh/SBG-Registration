// frontend/src/components/ui/GlobalBackground.tsx
// Global grid pattern only — logos are placed per-section

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 grid-bg" />
    </div>
  )
}
