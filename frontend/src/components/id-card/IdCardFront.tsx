// frontend/src/components/id-card/IdCardFront.tsx
import { type RefObject } from 'react'
import { StickerLayer } from './StickerLayer'
import type { PublicMember } from '../../types'

interface IdCardFrontProps {
  member: PublicMember
  stickerId: string
  cardRef?: RefObject<HTMLDivElement>
}

export function IdCardFront({ member, stickerId, cardRef }: IdCardFrontProps) {
  const isActive = member.status === 'approved'
  const memberSince = new Date(member.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-[3.375/2.125] bg-sbg-navy rounded-[12px] border border-white/[0.08]"
    >
      {/* SVG Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

      {/* Purple top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-sbg-purple" />

      {/* Purple accent squares */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-sbg-purple opacity-60" aria-hidden="true" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-sbg-purple-light opacity-40" aria-hidden="true" />
      <div className="absolute bottom-6 left-4 w-2 h-2 bg-sbg-purple opacity-30" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header: Logo + Status badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img src="/sbg-logo.svg" alt="SBG" className="h-9 w-9" />
            <div>
              <p className="font-mono text-white text-xs font-bold leading-tight">
                Student Builder Group
              </p>
              <p className="font-mono text-sbg-text-muted text-[10px]">
                PUP Biñan Campus
              </p>
            </div>
          </div>
          <span
            className={[
              'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border',
              isActive
                ? 'bg-green-900/40 text-green-400 border-green-700/50'
                : 'bg-white/5 text-sbg-text-muted border-white/10',
            ].join(' ')}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        {/* Member Name — prominent */}
        <h2 className="font-mono text-white text-xl font-bold leading-tight mb-1">
          {member.full_name}
        </h2>

        {/* Course + Year */}
        <p className="text-xs font-mono text-sbg-text-muted mb-3">
          {member.course ?? '—'} · Year {member.year_level} — {member.section}
        </p>

        {/* SBG ID — centered, large */}
        {member.sbg_id && (
          <div className="flex-1 flex items-center">
            <div className="w-full text-center py-2 bg-sbg-purple-muted/50 border border-sbg-purple/30 rounded-[8px]">
              <p className="text-[10px] font-mono text-sbg-text-muted uppercase tracking-widest mb-0.5">Membership ID</p>
              <p className="font-mono text-sbg-purple-light text-lg font-bold tracking-wider">
                {member.sbg_id}
              </p>
            </div>
          </div>
        )}

        {/* Footer: School year + member since */}
        <div className="flex items-end justify-between mt-3">
          {member.school_year && (
            <p className="text-[10px] font-mono text-sbg-text-muted">
              S.Y. {member.school_year}
            </p>
          )}
          <p className="text-[10px] font-mono text-sbg-text-muted">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Sticker — bottom right */}
      <StickerLayer stickerId={stickerId} />
    </div>
  )
}
