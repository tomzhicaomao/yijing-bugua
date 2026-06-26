import { useRef } from 'react'
import type { LineValue } from '../../types'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

interface HexagramBoardProps {
  lines: (LineValue | null)[]
  changingLinePositions?: number[]
  label?: string
  /** Phase 3: 当前已确认的爻数（逐爻积累） */
  revealedCount?: number
  /** 卦名（全卦完成后浮现） */
  hexagramName?: string
}

const LINE_LABELS: Record<number, string> = {
  6: '老阴 ⚋×',
  7: '少阳 ⚊',
  8: '少阴 ⚋',
  9: '老阳 ⚊○',
}

const POSITION_NAMES = ['初', '二', '三', '四', '五', '上']

export default function HexagramBoard({
  lines,
  changingLinePositions = [],
  label,
  revealedCount = 6,
  hexagramName,
}: HexagramBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const nameRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Phase 3: 逐爻入场动画
  useGSAP(() => {
    if (prefersReducedMotion) return
    const filled = lines.filter(l => l !== null).length
    const idx = filled - 1
    if (idx >= 0 && idx < 6) {
      const el = lineRefs.current[5 - idx]
      if (el) gsap.fromTo(el, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out', clearProps: 'x' })
    }
  }, { scope: containerRef, dependencies: [revealedCount] })

  // Phase 3: 卦名浮现
  useGSAP(() => {
    if (prefersReducedMotion || !nameRef.current) return
    if (lines.every(l => l !== null) && hexagramName) {
      gsap.fromTo(nameRef.current, { opacity: 0, y: 8, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' })
    }
  }, { scope: containerRef, dependencies: [lines, hexagramName] })

  // 持续动画
  useGSAP(() => {
    if (prefersReducedMotion) return
    lineRefs.current.forEach((line, i) => {
      if (!line) return
      const pos = 6 - i; const val = lines[pos - 1]; const ch = val !== null && changingLinePositions.includes(pos)
      if (val === 6 || val === 8) gsap.to(line, { rotation: 1, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (val === 7 || val === 9) gsap.to(line, { scaleX: 1.01, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (ch) gsap.to(line, { scale: 1.03, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    })
  }, { scope: containerRef, dependencies: [lines, changingLinePositions] })

  return (
    <div ref={containerRef} className="card-nothing">
      {label && <h3 className="text-xs font-medium text-nothing-text-secondary mb-2">{label}</h3>}
      <div className="space-y-1 max-h-[35vh] overflow-y-auto overscroll-contain">
        {[...lines].reverse().map((value, i) => {
          const position = 6 - i
          const isChanging = value !== null && changingLinePositions.includes(position)
          const isRevealed = position <= revealedCount

          return (
            <div
              key={position}
              ref={el => { lineRefs.current[i] = el }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded will-change-transform
                ${isChanging ? 'bg-nothing-accent-subtle border border-nothing-accent' : 'border border-nothing-border'}
                ${!isRevealed ? 'opacity-20' : ''}`}
            >
              <span className="text-xs text-nothing-text-secondary w-7 text-right shrink-0">
                {POSITION_NAMES[position - 1]}爻
              </span>
              <span className="text-sm text-nothing-text-primary tracking-wider min-w-[6ch]">
                {value !== null ? LINE_LABELS[value] : '·····'}
              </span>
              {isChanging && <span className="text-xs text-nothing-accent font-medium ml-auto shrink-0">动</span>}
            </div>
          )
        })}
      </div>
      {hexagramName && (
        <div ref={nameRef} className="mt-2 text-center text-nothing-accent text-xs tracking-widest">
          {hexagramName}
        </div>
      )}
    </div>
  )
}
