import { useState } from 'react'

interface MentorCardProps {
  photo: string
  name: string
  role: string
  quote?: string
}

export function MentorCard({ photo, name, role, quote }: MentorCardProps) {
  const [active, setActive] = useState(false)

  return (
    <button
      type="button"
      onClick={() => quote && setActive((v) => !v)}
      onMouseEnter={() => quote && setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      aria-expanded={active}
    >
      <img src={photo} alt={name} className="absolute inset-0 w-full h-full object-cover" />

      {/* base gradient — always visible for name/role legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* purple quote overlay */}
      {quote && (
        <div
          className="absolute inset-0 flex flex-col justify-center p-6 transition-all duration-500 ease-out"
          style={{
            background: 'linear-gradient(180deg, rgba(26,22,46,0.55) 0%, rgba(58,30,110,0.92) 100%)',
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <p
            className="text-white text-sm sm:text-base leading-relaxed transition-all duration-500 delay-100"
            style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(12px)' }}
          >
            "{quote}"
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-base">{name}</h3>
        <p className="text-white/70 text-xs mt-0.5">{role}</p>
      </div>
    </button>
  )
}