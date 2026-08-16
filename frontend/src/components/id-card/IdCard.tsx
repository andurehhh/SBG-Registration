// frontend/src/components/id-card/IdCard.tsx
import { useRef, useState } from 'react'
import { IdCardFront } from './IdCardFront'
import { IdCardBack } from './IdCardBack'
import { FlipCard } from '../registration/FlipCard'
import type { PublicMember } from '../../types'

interface IdCardProps {
  member: PublicMember
  stickerId: string
}

export function IdCard({ member, stickerId }: IdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[520px]">
      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sbg-accent/40 focus:ring-offset-2 focus:ring-offset-sbg-black rounded-[12px]"
        aria-label={isFlipped ? 'Show front of ID card' : 'Show back of ID card'}
      >
        <FlipCard
          front={
            <IdCardFront
              member={member}
              stickerId={stickerId}
              cardRef={frontRef}
            />
          }
          back={
            <IdCardBack
              member={member}
              stickerId={stickerId}
              cardRef={backRef}
            />
          }
          isFlipped={isFlipped}
        />
      </button>

      <p className="text-xs text-sbg-text-muted text-center font-mono">
        Tap the card to flip
      </p>
    </div>
  )
}
