// frontend/src/components/id-card/IdCardBack.tsx
import { type RefObject } from 'react'
import type { Member } from '../../types'

interface IdCardBackProps {
  member: Member
  stickerId: string
  cardRef?: RefObject<HTMLDivElement>
}

export function IdCardBack({ member, cardRef }: IdCardBackProps) {
  return (
    <div
      ref={cardRef}
      className="relative w-full min-h-[300px] bg-sbg-navy rounded-[12px] overflow-hidden border border-white/[0.08]"
    >
      {/* SVG Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />

      {/* Purple bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sbg-purple" />

      {/* Content */}
      <div className="relative z-10 p-7">
        {/* Student Number */}
        <div className="mb-5">
          <p className="text-xs font-mono text-sbg-text-muted uppercase tracking-wider mb-1">
            Student Number
          </p>
          <p className="font-mono text-white text-lg tracking-widest">
            {member.student_number}
          </p>
        </div>

        {/* AWS Interests */}
        {member.skills.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-mono text-sbg-text-muted uppercase tracking-wider mb-2">
              AWS Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-sbg-purple-muted border border-sbg-purple/30 rounded-[6px] text-xs font-mono text-sbg-purple-light"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* QR Code Placeholder / Decorative Grid */}
        <div className="flex items-end justify-between">
          <div
            className="w-16 h-16 border border-sbg-purple/30 rounded-[6px] grid-bg opacity-60"
            aria-label="QR code placeholder"
          />
          <p className="font-mono text-sbg-text-muted text-xs text-right">
            AWS Student Builder
          </p>
        </div>
      </div>
    </div>
  )
}
