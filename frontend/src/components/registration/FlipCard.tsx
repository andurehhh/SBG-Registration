// frontend/src/components/registration/FlipCard.tsx
import { useRef, type ReactNode } from 'react'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  isFlipped: boolean
  onFlipEnd?: () => void
}

export function FlipCard({ front, back, isFlipped, onFlipEnd }: FlipCardProps) {
  const innerRef = useRef<HTMLDivElement>(null)

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    // Only fire for the transform property on the inner element
    if (e.propertyName === 'transform' && e.target === innerRef.current) {
      onFlipEnd?.()
    }
  }

  return (
    <div
      style={{ perspective: '1200px' }}
      className="w-full"
    >
      <div
        ref={innerRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Front face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {front}
        </div>

        {/* Back face */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}
