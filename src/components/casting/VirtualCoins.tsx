import { useState, useCallback, useRef } from "react"
import { tossCoinsDetailed } from "../../engine/casting.js"
import type { LineValue } from "../../types"
import { gsap, useGSAP } from "../../lib/gsap.js"
import { useReducedMotion } from "../../hooks/useReducedMotion.js"

interface VirtualCoinsProps {
  currentIndex: number
  onCast: (value: LineValue) => void
}

const POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
const LINE_NAMES: Record<LineValue, string> = { 6: '老阴 ⚋×', 7: '少阳 ⚊', 8: '少阴 ⚋', 9: '老阳 ⚊○' }

type CoinFace = 'front' | 'back'

export default function VirtualCoins({ currentIndex, onCast }: VirtualCoinsProps) {
  const [phase, setPhase] = useState<"idle" | "flipping" | "result">("idle")
  const [coins, setCoins] = useState<CoinFace[] | null>(null)
  const [resultValue, setResultValue] = useState<LineValue | null>(null)
  const prefersReducedMotion = useReducedMotion()
  
  // Refs for coin elements
  const coinRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  
  // GSAP context for animations
  useGSAP(() => {
    // Initialize coins
    gsap.set(coinRefs.current, {
      rotationY: 0,
      scale: 1,
      transformPerspective: 400,
    })
  }, { scope: containerRef })

  const handleToss = useCallback(() => {
    if (currentIndex >= 6 || phase !== "idle") return

    setPhase("flipping")
    setCoins(null)
    setResultValue(null)

    // Create GSAP timeline for coin toss animation
    const tl = gsap.timeline({
      onComplete: () => {
        // After animation completes, show results
        const { coinResults, lineValue } = tossCoinsDetailed()
        setCoins(coinResults.map(v => v === 1 ? 'back' as const : 'front' as const))
        setResultValue(lineValue)
        setPhase("result")
      }
    })

    // Animate each coin with stagger
    coinRefs.current.forEach((coin, i) => {
      if (!coin) return
      
      tl.to(coin, {
        rotationY: 360,
        scale: 1.15,
        duration: 0.6,
        ease: "power2.inOut",
        transformPerspective: 400,
      }, i * 0.08) // Stagger by 0.08s
      
      // Add bounce effect at the end
      tl.to(coin, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.3)",
      }, `-=${0.1}`) // Overlap slightly with previous animation
    })

    // If reduced motion, skip animation
    if (prefersReducedMotion) {
      tl.progress(1) // Jump to end
    }
  }, [currentIndex, phase, onCast, prefersReducedMotion])

  const confirmResult = useCallback(() => {
    if (resultValue === null) return
    onCast(resultValue)
    setPhase("idle")
    setCoins(null)
    setResultValue(null)
  }, [resultValue, onCast])

  if (currentIndex >= 6) return null

  const backCount = coins?.filter(c => c === 'back').length ?? 0
  const lineLabel = POSITION_NAMES[currentIndex] ?? ''

  return (
    <div className="space-y-4 text-center">
      <div className="text-sm text-stone-500">
        {lineLabel} · 第 {currentIndex + 1}/6 爻
      </div>

      {/* Three coins */}
      <div ref={containerRef} className="flex justify-center gap-8 py-6">
        {[0, 1, 2].map((i) => {
          let symbol: string
          let coinClass: string

          if (phase === "idle") {
            symbol = "文"
            coinClass = "border-stone-400 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-600"
          } else if (phase === "flipping") {
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
              className={"w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-full border-2 flex items-center justify-center text-xl shadow-sm will-change-transform " + coinClass}
              aria-label={phase === "result" ? (coins?.[i] === "back" ? "背" : "字") : "铜钱"}
            >
              {symbol}
            </div>
          )
        })}
      </div>

      {/* Result display */}
      {phase === "result" && resultValue !== null && (
        <div className="space-y-3 bg-white rounded-lg p-4 border border-stone-200 shadow-sm">
          <p className="text-ink">
            <span className="font-medium">{backCount} 背 {3 - backCount} 字</span>
            <span className="mx-2 text-stone-400">→</span>
            <span className="font-bold text-lg text-bronze">{resultValue}</span>
            <span className="text-sm ml-2 text-stone-500">{LINE_NAMES[resultValue]}</span>
          </p>
          <button
            onClick={confirmResult}
            className="px-8 py-2.5 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark transition-colors shadow-md"
          >
            确认此爻
          </button>
        </div>
      )}

      {/* Toss button */}
      {phase === "idle" && (
        <button
          onClick={handleToss}
          className="px-10 py-3.5 bg-bronze text-white rounded-lg font-medium text-lg hover:bg-bronze-light shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          {currentIndex === 0 ? "掷铜钱" : "再掷一次"}
        </button>
      )}

      <p className="text-sm text-stone-400">
        {phase === "idle" && (currentIndex === 0 ? "点击按钮掷出三枚铜钱" : `已完成 ${currentIndex}/6 爻`)}
        {phase === "flipping" && "铜钱落地中..."}
        {phase === "result" && "查看结果后点击确认"}
      </p>
    </div>
  )
}
