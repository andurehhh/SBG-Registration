// frontend/src/components/id-card/IdCardFront.tsx
import { type RefObject } from 'react'
import { StickerLayer } from './StickerLayer'
import type { Member } from '../../types'

interface IdCardFrontProps {
  member: Member
  stickerId: string
  cardRef?: RefObject<HTMLDivElement>
}

export function IdCardFront({ member, stickerId, cardRef }: IdCardFrontProps) {
  return (
    <div
      ref={cardRef}
      className="relative w-full min-h-[300px] bg-sbg-navy rounded-[12px] overflow-hidden border border-white/[0.08]"
    >
      {/* SVG Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden="true" />

      {/* Purple top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-sbg-purple" />

      {/* Purple accent squares */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-sbg-purple opacity-60" aria-hidden="true" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-sbg-purple-light opacity-40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 p-7 pt-6">
        {/* Header: Logo + AWS badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src="/sbg-logo.svg" alt="SBG" className="h-10 w-10" />
            <div>
              <p className="font-mono text-white text-sm font-bold leading-tight">
                Student Builder Group
              </p>
              <p className="font-mono text-sbg-text-muted text-xs">
                PUP Biñan Campus
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-sbg-orange/20 border border-sbg-orange/40 rounded text-sbg-orange text-xs font-mono font-bold">
            AWS
          </span>
        </div>

        {/* Member Name */}
        <h2 className="font-mono text-white text-2xl font-bold leading-tight mb-3">
          {member.full_name}
        </h2>

        {/* SBG ID Badge */}
        {member.sbg_id && (
          <div className="inline-flex items-center px-3 py-1.5 bg-sbg-purple-muted border border-sbg-purple/40 rounded-[8px] mb-4">
            <span className="font-mono text-sbg-purple-light text-base font-bold tracking-widest">
              {member.sbg_id}
            </span>
          </div>
        )}

        {/* Course + Year/Section */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs font-mono text-sbg-text-muted uppercase tracking-wider mb-0.5">Course</p>
            <p className="text-sm font-mono text-white">{member.course ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-sbg-text-muted uppercase tracking-wider mb-0.5">Year & Section</p>
            <p className="text-sm font-mono text-white">
              {member.year_level && member.section
                ? `${member.year_level} — ${member.section}`
                : '—'}
            </p>
          </div>
        </div>

        {/* School Year */}
        {member.school_year && (
          <p className="text-xs font-mono text-sbg-text-muted">
            S.Y. {member.school_year}
          </p>
        )}
      </div>

      {/* Sticker — bottom right */}
      <StickerLayer stickerId={stickerId} />
    </div>
  )
}
