// frontend/src/components/id-card/IdCardBack.tsx
import { type RefObject } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { PublicMember } from '../../types'

interface IdCardBackProps {
  member: PublicMember
  stickerId: string
  cardRef?: RefObject<HTMLDivElement>
}

export function IdCardBack({ member, cardRef }: IdCardBackProps) {
  const qrValue = member.sbg_id ?? member.student_number

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-[3.375/2.125] bg-[#161616] rounded-[12px] border border-white/[0.08]"
    >
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#2f8fff]" />

      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] text-sbg-text-muted uppercase tracking-wider mb-1 font-mono">
              Student Number
            </p>
            <p className="text-white text-base tracking-widest font-mono">
              {member.student_number}
            </p>
          </div>

          <div className="bg-white p-1.5 rounded-[6px]">
            <QRCodeSVG
              value={qrValue}
              size={64}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f1117"
            />
          </div>
        </div>

        {member.skills.length > 0 && (
          <div className="flex-1">
            <p className="text-[10px] text-sbg-text-muted uppercase tracking-wider mb-2 font-mono">
              AWS Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-[#2f8fff]/10 border border-[#2f8fff]/30 rounded-[4px] text-[10px] text-[#2f8fff]"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 5 && (
                <span className="px-2 py-0.5 text-[10px] text-sbg-text-muted font-mono">
                  +{member.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mt-auto pt-3">
          <div>
            <p className="text-sbg-text-muted text-[10px] font-mono">
              AWS Student Builder Group
            </p>
            <p className="text-sbg-text-muted text-[9px] font-mono">
              PUP Biñan Campus
            </p>
          </div>
          {member.school_year && (
            <p className="text-sbg-text-muted text-[10px] font-mono">
              {member.school_year}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
