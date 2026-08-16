// frontend/src/components/ui/SbgLogoDecor.tsx
// Decorative SBG logo in any color, used as section stickers

interface SbgLogoDecorProps {
  size: number
  color: string
  className?: string
}

export function SbgLogoDecor({ size, color, className = '' }: SbgLogoDecorProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 540 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="180" y="420" width="60" height="60" fill={color} />
      <rect x="120" y="420" width="60" height="60" fill={color} />
      <rect x="360" y="420" width="60" height="60" fill={color} />
      <rect x="300" y="420" width="60" height="60" fill={color} />
      <rect x="240" y="420" width="60" height="60" fill={color} />
      <rect x="120" y="480" width="60" height="60" fill={color} />
      <rect x="360" y="480" width="60" height="60" fill={color} />
      <rect x="240" y="480" width="60" height="60" fill={color} />
      <rect x="60" y="300" width="60" height="60" fill={color} />
      <rect x="60" y="360" width="60" height="60" fill={color} />
      <rect x="60" y="120" width="60" height="60" fill={color} />
      <rect x="60" y="180" width="60" height="60" fill={color} />
      <rect x="60" y="240" width="60" height="60" fill={color} />
      <rect x="0" y="360" width="60" height="60" fill={color} />
      <rect x="0" y="120" width="60" height="60" fill={color} />
      <rect x="0" y="240" width="60" height="60" fill={color} />
      <rect x="300" y="60" width="60" height="60" fill={color} />
      <rect x="360" y="60" width="60" height="60" fill={color} />
      <rect x="120" y="60" width="60" height="60" fill={color} />
      <rect x="180" y="60" width="60" height="60" fill={color} />
      <rect x="240" y="60" width="60" height="60" fill={color} />
      <rect x="360" y="0" width="60" height="60" fill={color} />
      <rect x="120" y="0" width="60" height="60" fill={color} />
      <rect x="240" y="0" width="60" height="60" fill={color} />
      <rect x="420" y="180" width="60" height="60" fill={color} />
      <rect x="420" y="120" width="60" height="60" fill={color} />
      <rect x="420" y="360" width="60" height="60" fill={color} />
      <rect x="420" y="300" width="60" height="60" fill={color} />
      <rect x="420" y="240" width="60" height="60" fill={color} />
      <rect x="480" y="120" width="60" height="60" fill={color} />
      <rect x="480" y="360" width="60" height="60" fill={color} />
      <rect x="480" y="240" width="60" height="60" fill={color} />
    </svg>
  )
}
