// frontend/src/components/id-card/StickerLayer.tsx
interface StickerLayerProps {
  stickerId: string
}

export function StickerLayer({ stickerId }: StickerLayerProps) {
  return (
    <div className="absolute bottom-4 right-4 w-16 h-16 pointer-events-none">
      <img
        src={`/stickers/${stickerId}.png`}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Hide if sticker not found
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
