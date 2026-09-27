// frontend/src/components/id-card/IdCard.tsx
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import { IdCardFront } from './IdCardFront'
import { IdCardBack } from './IdCardBack'
import { FlipCard } from '../registration/FlipCard'
import { Button } from '../ui/Button'
import type { PublicMember } from '../../types'

interface IdCardProps {
  member: PublicMember
  stickerId: string
}

export function IdCard({ member, stickerId }: IdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  async function handleDownload() {
    // FlipCard only mounts the visible side, so capture whichever is showing.
    const node = isFlipped ? backRef.current : frontRef.current
    if (!node) return

    setDownloading(true)
    setDownloadError(null)
    try {
      // Ensure the mono font is loaded before capture, otherwise html-to-image
      // can render the card with a fallback font or drop glyphs.
      if (document.fonts?.ready) {
        await document.fonts.ready
      }

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3, // crisp, print-friendly export
        backgroundColor: '#161616',
      })

      const side = isFlipped ? 'back' : 'front'
      const idPart = member.sbg_id ?? member.student_number
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = `SBG-ID-${idPart}-${side}.png`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    } catch (err) {
      console.error('ID card download failed:', err)
      setDownloadError('Could not generate the image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

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

      <Button
        type="button"
        onClick={handleDownload}
        loading={downloading}
        icon={<Download className="w-4 h-4" />}
        className="w-full"
      >
        {downloading
          ? 'Preparing image…'
          : `Download ${isFlipped ? 'back' : 'front'} as image`}
      </Button>

      {downloadError && (
        <p role="alert" className="text-xs text-red-400 text-center font-mono">
          {downloadError}
        </p>
      )}
    </div>
  )
}
