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
      className="relative w-full aspect-[3.375/2.125] bg-sbg-navy rounded-[12px] border border-white/[0.08]"
    >
      {/* SVG Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden="true" />

      {/* Purple bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-sbg-purple" />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Top section: Student number + QR */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono text-sbg-text-muted uppercase tracking-wider mb-1">
              Student Number
            </p>
            <p className="font-mono text-white text-base tracking-widest">
              {member.student_number}
            </p>
          </div>

          {/* QR Code */}
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

        {/* AWS Interests */}
        {member.skills.length > 0 && (
          <div className="flex-1">
            <p className="text-[10px] font-mono text-sbg-text-muted uppercase tracking-wider mb-2">
              AWS Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-sbg-purple-muted border border-sbg-purple/30 rounded-[4px] text-[10px] font-mono text-sbg-purple-light"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 5 && (
                <span className="px-2 py-0.5 text-[10px] font-mono text-sbg-text-muted">
                  +{member.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between mt-auto pt-3">
          <div>
            <p className="font-mono text-sbg-text-muted text-[10px]">
              AWS Student Builder Group
            </p>
            <p className="font-mono text-sbg-text-muted text-[9px]">
              PUP Biñan Campus
            </p>
          </div>
          {member.school_year && (
            <p className="font-mono text-sbg-text-muted text-[10px]">
              {member.school_year}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
