import { useState, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

const WORDS = ['fellow builders', 'real-world tech', 'future leaders', 'AWS SBG PUP BC.']

export function TypingWords({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const prefersReduced = useReducedMotion()
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState(prefersReduced ? WORDS[WORDS.length - 1] : '')
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    if (prefersReduced) return
    const isLast = wordIndex === WORDS.length - 1
    const current = WORDS[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 55)
      } else if (!isLast) {
        timeout = setTimeout(() => setPhase('pausing'), 1000)
      }
      // if isLast, just stay — typing effect ends here
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), 600)
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 30)
      } else {
        setWordIndex((i) => i + 1)
        setPhase('typing')
      }
    }
    return () => clearTimeout(timeout)
  }, [text, phase, wordIndex, prefersReduced])

  return (
    <span className={className} style={style}>
      {text}
      <span className="animate-pulse" aria-hidden="true">|</span>
    </span>
  )
}