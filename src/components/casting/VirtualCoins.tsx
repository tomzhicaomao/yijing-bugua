import { useState, useCallback, useRef, useEffect } from "react"
import { tossCoinsDetailed } from "../../engine/casting.js"
import type { LineValue } from "../../types"
import { gsap, useGSAP } from "../../lib/gsap.js"
import { useReducedMotion } from "../../hooks/useReducedMotion.js"
import { playToss, playAllLands, vibrateToss } from "../../lib/audio.js"

interface VirtualCoinsProps {
  currentIndex: number
  onCast: (value: LineValue) => void
}

const POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
const LINE_NAMES: Record<LineValue, string> = { 6: '老阴 ⚋×', 7: '少阳 ⚊', 8: '少阴 ⚋', 9: '老阳 ⚊○' }

type CoinFace = 'front' | 'back'

export default function VirtualCoins({ currentIndex, onCast }: VirtualCoinsProps) {
  const [flipping, setFlipping] = useState(false)
  const [coins, setCoins] = useState<CoinFace[] | null>(null)
  const [resultValue, setResultValue] = useState<LineValue | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Refs for coin elements
  const coinRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const tossTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (tossTimerRef.current) clearTimeout(tossTimerRef.current)
    }
  }, [])

  // Reset state when advancing to next line
  useEffect(() => {
    setFlipping(false)
    setCoins(null)
    setResultValue(null)
  }, [currentIndex])

  // GSAP context for animations
  useGSAP(() => {
    gsap.set(coinRefs.current, {
      rotationY: 0,
      scale: 1,
      transformPerspective: 400,
    })
  }, { scope: containerRef })

  const handleToss = useCallback(() => {
    if (currentIndex >= 6 || flipping) return

    setFlipping(true)
    setCoins(null)
    setResultValue(null)

    playToss()
    vibrateToss()

    const tl = gsap.timeline({
      onComplete: () => {
        if (!mountedRef.current) return
        playAllLands()
        const { coinResults, lineValue } = tossCoinsDetailed()
        setCoins(coinResults.map(v => v === 1 ? 'back' as const : 'front' as const))
        setResultValue(lineValue)

        // Auto-confirm after brief display
        tossTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          onCast(lineValue)
          // State will be reset by the currentIndex change effect
        }, 600)
      }
    })

    coinRefs.current.forEach((coin, i) => {
      if (!coin) return
      tl.to(coin, { rotationY: 360, scale: 1.15, duration: 0.6, ease: "power2.inOut", transformPerspective: 400 }, i * 0.08)
      tl.to(coin, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }, "-=0.1")
    })

    if (prefersReducedMotion) tl.progress(1)
  }, [currentIndex, flipping, onCast, prefersReducedMotion])

  if (currentIndex >= 6) return null

  const backCount = coins?.filter(c => c === 'back').length ?? 0
  const lineLabel = POSITION_NAMES[currentIndex] ?? ''

  const idle = !flipping && !resultValue

  return (
    <div className="text-center">
      <div className="space-y-4">
        <div className="text-sm text-stone-500">
          {lineLabel} · 第 {currentIndex + 1}/6 爻
        </div>

        {/* Three coins — click to toss */}
        <div ref={containerRef} className="flex justify-center gap-8 py-6">
          {[0, 1, 2].map((i) => {
            let symbol: string
            let coinClass: string

            if (idle) {
              symbol = "文"
              coinClass = "border-stone-400 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-600 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            } else if (flipping) {
              symbol = "文"
              coinClass = "border-stone-400 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-600"
            } else if (coins) {
              const isBack = coins[i] === 'back'
              symbol = isBack ? "背" : "字"
              coinClass = isBack
                ? "border-gold bg-gradient-to-b from-gold/30 to-bronze/20 text-bronze font-bold shadow-md"
                : "border-stone-400 bg-gradient-to-b from-stone-100 to-stone-200 text-ink-light"
            } else {
              symbol = "○"
              coinClass = "border-stone-300 bg-stone-100 text-stone-400"
            }

            return (
              <div
                key={i}
                ref={el => { coinRefs.current[i] = el }}
                className={"w-[4.5rem] h-[4.5rem] rounded-full border-2 flex items-center justify-center text-xl shadow-sm will-change-transform " + coinClass}
                onClick={idle ? handleToss : undefined}
                role="button"
                tabIndex={idle ? 0 : undefined}
                aria-label={resultValue ? (coins?.[i] === "back" ? "背" : "字") : "点击掷铜钱"}
              >
                {symbol}
              </div>
            )
          })}
        </div>

        {/* Result display — same height always */}
        <div className={`rounded-lg p-4 border shadow-sm mx-4 transition-opacity duration-300 min-h-[3.5rem] flex items-center justify-center ${
          resultValue !== null
            ? 'bg-white border-stone-200 visible opacity-100'
            : 'border-transparent invisible opacity-0'
        }`}>
          {resultValue !== null ? (
            <p className="text-ink">
              <span className="font-medium">{backCount} 背 {3 - backCount} 字</span>
              <span className="mx-2 text-stone-400">→</span>
              <span className="font-bold text-lg text-bronze">{resultValue}</span>
              <span className="text-sm ml-2 text-stone-500">{LINE_NAMES[resultValue]}</span>
            </p>
          ) : <span className="text-ink">&nbsp;</span>}
        </div>

        <p className="text-sm text-stone-400">
          {idle && (currentIndex === 0 ? "点击任意铜钱掷出" : `已完成 ${currentIndex}/6 爻，继续点击铜钱`)}
          {flipping && "铜钱落地中..."}
          {resultValue && !flipping && "结果已记录，准备下一爻..."}
        </p>
      </div>
    </div>
  )
}
