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
      className="relative w-full aspect-[3.375/2.125] bg-[#161616] rounded-[12px] border border-white/[0.08]"
    >
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#AE5CFF]" />

      <div className="absolute top-4 right-4 w-3 h-3 bg-[#AE5CFF] opacity-60" aria-hidden="true" />
      <div className="absolute top-8 right-8 w-2 h-2 bg-[#AE5CFF] opacity-40" aria-hidden="true" />
      <div className="absolute bottom-6 left-4 w-2 h-2 bg-[#AE5CFF] opacity-30" aria-hidden="true" />

      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <img src="/sbg-logo-white.svg" alt="SBG" className="h-9 w-9" />
            <div>
              <p className="text-white text-xs font-bold leading-tight font-mono">
                Student Builder Group
              </p>
              <p className="text-sbg-text-muted text-[10px] font-mono">
                PUP Biñan Campus
              </p>
            </div>
          </div>
          <span
            className={[
              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
              isActive
                ? 'bg-green-900/40 text-green-400 border-green-700/50'
                : 'bg-white/5 text-sbg-text-muted border-white/10',
            ].join(' ')}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <h2 className="text-white text-xl font-bold leading-tight mb-1 font-mono">
          {member.full_name}
        </h2>

        <p className="text-xs text-sbg-text-muted mb-3 font-mono">
          {member.course ?? '—'} · Year {member.year_level} — {member.section}
        </p>

        {member.sbg_id && (
          <div className="flex-1 flex items-center">
            <div className="w-full text-center py-2 bg-[#AE5CFF]/10 border border-[#AE5CFF]/30 rounded-[8px]">
              <p className="text-[10px] text-sbg-text-muted uppercase tracking-widest mb-0.5 font-mono">Membership ID</p>
              <p className="text-[#AE5CFF] text-lg font-bold tracking-wider font-mono">
                {member.sbg_id}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mt-3">
          {member.school_year && (
            <p className="text-[10px] text-sbg-text-muted font-mono">
              S.Y. {member.school_year}
            </p>
          )}
          <p className="text-[10px] text-sbg-text-muted font-mono">
            Member since {memberSince}
          </p>
        </div>
      </div>

      <StickerLayer stickerId={stickerId} />
    </div>
  )
}
