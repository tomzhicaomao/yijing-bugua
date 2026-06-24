import { useRef } from 'react'
import type { LineValue } from '../../types'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

interface HexagramBoardProps {
  lines: (LineValue | null)[]
  changingLinePositions?: number[]
  label?: string
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
}: HexagramBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReducedMotion = useReducedMotion()
  
  // GSAP context for animations
  useGSAP(() => {
    if (prefersReducedMotion) return
    
    // Animate lines entrance with stagger
    gsap.from(lineRefs.current, {
      opacity: 0,
      x: -20,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.2,
    })
    
    // Animate each line with yin/yang specific effects
    lineRefs.current.forEach((line, i) => {
      if (!line) return
      const position = 6 - i
      const value = lines[position - 1]
      const isChanging = changingLinePositions.includes(position)
      
      // Yin lines (6, 8) - broken lines - add subtle rotation
      if (value === 6 || value === 8) {
        gsap.to(line, {
          rotation: 1,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
      
      // Yang lines (7, 9) - solid lines - add subtle scale pulse
      if (value === 7 || value === 9) {
        gsap.to(line, {
          scaleX: 1.01,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
      
      // Changing lines - stronger pulse effect
      if (isChanging) {
        gsap.to(line, {
          scale: 1.03,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    })
  }, { scope: containerRef, dependencies: [lines, changingLinePositions] })
  return (
    <div ref={containerRef} className="card-nothing">
      {label && <h3 className="text-sm font-medium text-nothing-text-secondary mb-3">{label}</h3>}
      <div className="space-y-1.5">
        {[...lines].reverse().map((value, i) => {
          const position = 6 - i
          const isChanging = value !== null && changingLinePositions.includes(position)

          return (
            <div
              key={position}
              ref={el => { lineRefs.current[i] = el }}
              className={`flex items-center gap-3 px-3 py-2 rounded will-change-transform
              ${isChanging ? 'bg-nothing-accent-subtle border border-nothing-accent' : 'border border-nothing-border'}
                ${value === null ? 'opacity-30' : ''}`}
            >
              <span className="text-xs text-nothing-text-secondary w-8 text-right">
                {POSITION_NAMES[position - 1]}爻
              </span>
              <span className="text-lg text-nothing-text-primary tracking-wider">
                {value !== null ? LINE_LABELS[value] : '···'}
              </span>
              {isChanging && (
                <span className="text-xs text-nothing-accent font-medium ml-auto">动</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
