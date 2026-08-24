import { useState, useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

interface TerminalLine {
  type: 'command' | 'output' | 'success' | 'blank'
  text: string
}

const LINES: TerminalLine[] = [
  { type: 'command', text: 'aws configure --profile sbg-builder' },
  { type: 'output', text: 'AWS Access Key ID: ****CONFIGURED' },
  { type: 'output', text: 'Default region: ap-southeast-1' },
  { type: 'success', text: 'Profile [sbg-builder] ready.' },
  { type: 'blank', text: '' },
  { type: 'command', text: 'cd ~/projects/sbg-portal && npm run deploy' },
  { type: 'output', text: 'Building production bundle...' },
  { type: 'output', text: 'Uploading to S3: sbg-portal-prod' },
  { type: 'output', text: 'Invalidating CloudFront cache...' },
  { type: 'success', text: '✓ Deployed to https://sbg.pupbinan.cloud' },
  { type: 'blank', text: '' },
  { type: 'command', text: 'echo "Day one starts now."' },
  { type: 'success', text: 'Day one starts now.' },
]

export function TypingTerminal({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReduced = useReducedMotion()
  const [visibleLines, setVisibleLines] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isInView) return

    if (prefersReduced) {
      setVisibleLines(LINES.length)
      return
    }

    let lineIndex = 0
    let charIndex = 0
    let timeout: ReturnType<typeof setTimeout>

    function typeLine() {
      if (lineIndex >= LINES.length) return

      const line = LINES[lineIndex]

      if (line.type === 'blank') {
        setVisibleLines(lineIndex + 1)
        setCurrentText('')
        setIsTyping(false)
        lineIndex++
        timeout = setTimeout(typeLine, 200)
        return
      }

      if (line.type === 'command') {
        setIsTyping(true)
        if (charIndex <= line.text.length) {
          setCurrentText(line.text.slice(0, charIndex))
          charIndex++
          timeout = setTimeout(typeLine, 25 + Math.random() * 35)
        } else {
          setVisibleLines(lineIndex + 1)
          setCurrentText('')
          setIsTyping(false)
          charIndex = 0
          lineIndex++
          timeout = setTimeout(typeLine, 400)
        }
      } else {
        // Output/success lines appear instantly after a short delay
        setVisibleLines(lineIndex + 1)
        setCurrentText('')
        setIsTyping(false)
        charIndex = 0
        lineIndex++
        timeout = setTimeout(typeLine, 150)
      }
    }

    timeout = setTimeout(typeLine, 600)
    return () => clearTimeout(timeout)
  }, [isInView, prefersReduced])

  return (
    <div ref={ref} className={`rounded-xl overflow-hidden ${className}`} style={{ border: '1px solid var(--border)', background: '#0a0e17' }}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>
          builder@sbg-pup-binan
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4 sm:p-5 font-mono text-[12px] sm:text-[13px] leading-[1.8] min-h-[280px]" style={{ fontFamily: 'var(--font-mono)' }}>
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i}>
            {line.type === 'blank' && <br />}
            {line.type === 'command' && (
              <span>
                <span style={{ color: '#38bdf8' }}>$</span>{' '}
                <span style={{ color: '#f0f9ff' }}>{line.text}</span>
              </span>
            )}
            {line.type === 'output' && (
              <span style={{ color: '#64748b' }}>{line.text}</span>
            )}
            {line.type === 'success' && (
              <span style={{ color: '#4ade80' }}>{line.text}</span>
            )}
          </div>
        ))}

        {/* Currently typing line */}
        {isTyping && (
          <div>
            <span style={{ color: '#38bdf8' }}>$</span>{' '}
            <span style={{ color: '#f0f9ff' }}>{currentText}</span>
            <span className="animate-pulse" style={{ color: '#38bdf8' }}>|</span>
          </div>
        )}

        {/* Idle cursor */}
        {!isTyping && visibleLines >= LINES.length && (
          <div>
            <span style={{ color: '#38bdf8' }}>$</span>{' '}
            <span className="animate-pulse" style={{ color: '#38bdf8' }}>|</span>
          </div>
        )}
      </div>
    </div>
  )
}
