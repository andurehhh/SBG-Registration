// frontend/src/components/registration/FlipCard.tsx
import { useState, useEffect, type ReactNode } from 'react'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  isFlipped: boolean
  onFlipEnd?: () => void
}

export function FlipCard({ front, back, isFlipped, onFlipEnd }: FlipCardProps) {
  const [showBack, setShowBack] = useState(isFlipped)
  const [animating, setAnimating] = useState(false)
  const onFlipEndRef = { current: onFlipEnd }
  onFlipEndRef.current = onFlipEnd

  useEffect(() => {
    if (isFlipped !== showBack) {
      setAnimating(true)
      const timer = setTimeout(() => {
        setShowBack(isFlipped)
        setAnimating(false)
        onFlipEndRef.current?.()
      }, 200)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped])

  return (
    <div className="w-full">
      <div
        className={[
          'w-full transition-transform duration-200 ease-in-out',
          animating ? 'scale-x-0' : 'scale-x-100',
        ].join(' ')}
      >
        {showBack ? back : front}
      </div>
    </div>
  )
}
