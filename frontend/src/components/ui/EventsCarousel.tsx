// frontend/src/components/ui/EventsCarousel.tsx
// A flip-through photo gallery — click side images to navigate, smooth slide animation
import { useState, useEffect } from 'react'

export interface CarouselItem {
  id: string
  image: string
  title: string
  description: string
}

interface EventsCarouselProps {
  items: CarouselItem[]
}

export function EventsCarousel({ items }: EventsCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  if (items.length === 0) return null

  function goTo(index: number) {
    const normalized = (index + items.length) % items.length
    setDirection(normalized > current || (current === items.length - 1 && normalized === 0) ? 'right' : 'left')
    setCurrent(normalized)
  }

  // Auto-advance every 9 seconds
  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setDirection('right')
      setCurrent((prev) => (prev + 1) % items.length)
    }, 9000)
    return () => clearInterval(timer)
  }, [items.length])

  const prevIndex = (current - 1 + items.length) % items.length
  const nextIndex = (current + 1) % items.length

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Container with overflow visible for side previews */}
      <div className="relative flex items-center justify-center gap-4 md:gap-6 px-4">

        {/* Previous image (clickable) */}
        {items.length > 1 && (
          <button
            onClick={() => goTo(prevIndex)}
            className="hidden sm:block flex-shrink-0 w-[140px] md:w-[180px] aspect-[16/9] rounded-[8px] overflow-hidden opacity-40 hover:opacity-60 transition-all duration-300 border border-white/[0.06]"
            aria-label={`Go to: ${items[prevIndex].title}`}
          >
            <img
              src={items[prevIndex].image}
              alt={items[prevIndex].title}
              className="w-full h-full object-cover"
            />
          </button>
        )}

        {/* Current image (main) */}
        <div
          className="relative flex-shrink-0 w-full sm:w-[480px] md:w-[560px] h-[340px] sm:h-[360px] rounded-[8px] overflow-hidden border border-white/[0.10] bg-sbg-navy shadow-2xl flex flex-col"
          key={current}
          style={{
            animation: `slideIn${direction === 'right' ? 'Right' : 'Left'} 0.35s ease-out`,
          }}
        >
          <div className="relative flex-1 overflow-hidden">
            <img
              src={items[current].image}
              alt={items[current].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-sbg-navy/90 to-transparent" />
          </div>
          <div className="px-5 py-4 bg-sbg-navy/80 backdrop-blur-sm flex-shrink-0">
            <h3 className="font-mono text-white text-sm font-bold">{items[current].title}</h3>
            <p className="text-sbg-text-muted text-xs mt-1 leading-relaxed line-clamp-2">{items[current].description}</p>
          </div>
        </div>

        {/* Next image (clickable) */}
        {items.length > 1 && (
          <button
            onClick={() => goTo(nextIndex)}
            className="hidden sm:block flex-shrink-0 w-[140px] md:w-[180px] aspect-[16/9] rounded-[8px] overflow-hidden opacity-40 hover:opacity-60 transition-all duration-300 border border-white/[0.06]"
            aria-label={`Go to: ${items[nextIndex].title}`}
          >
            <img
              src={items[nextIndex].image}
              alt={items[nextIndex].title}
              className="w-full h-full object-cover"
            />
          </button>
        )}
      </div>

      {/* Mobile swipe hint — tap sides of main image on mobile */}
      {items.length > 1 && (
        <div className="sm:hidden flex justify-center gap-6 mt-4">
          <button
            onClick={() => goTo(prevIndex)}
            className="w-16 aspect-[16/9] rounded-[6px] overflow-hidden opacity-50 border border-white/[0.08]"
            aria-label="Previous"
          >
            <img src={items[prevIndex].image} alt="" className="w-full h-full object-cover" />
          </button>
          <button
            onClick={() => goTo(nextIndex)}
            className="w-16 aspect-[16/9] rounded-[6px] overflow-hidden opacity-50 border border-white/[0.08]"
            aria-label="Next"
          >
            <img src={items[nextIndex].image} alt="" className="w-full h-full object-cover" />
          </button>
        </div>
      )}
    </div>
  )
}
