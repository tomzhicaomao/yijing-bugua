import { useReducer, useCallback, useRef, useEffect } from "react"
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

interface CoinState {
  phase: 'idle' | 'result'
  coins: CoinFace[] | null
  resultValue: LineValue | null
}

type CoinAction =
  | { type: 'reset' }
  | { type: 'toss'; coins: CoinFace[]; resultValue: LineValue }

function coinReducer(_state: CoinState, action: CoinAction): CoinState {
  switch (action.type) {
    case 'reset': return { phase: 'idle', coins: null, resultValue: null }
    case 'toss': return { phase: 'result', coins: action.coins, resultValue: action.resultValue }
  }
}

export default function VirtualCoins({ currentIndex, onCast }: VirtualCoinsProps) {
  const [state, dispatch] = useReducer(coinReducer, { phase: 'idle', coins: null, resultValue: null })
  const prefersReducedMotion = useReducedMotion()
  const coinRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const onCastRef = useRef(onCast)

  useEffect(() => { onCastRef.current = onCast }, [onCast])
  useEffect(() => { return () => { mountedRef.current = false } }, [])
  useEffect(() => { dispatch({ type: 'reset' }) }, [currentIndex])

  useGSAP(() => {
    gsap.set(coinRefs.current, { rotationY: 0, scale: 1, transformPerspective: 400 })
  }, { scope: containerRef })

  const handleToss = useCallback(() => {
    if (currentIndex >= 6 || state.phase !== 'idle') return

    try { playToss(); vibrateToss() } catch { /* ignore */ }
    const { coinResults, lineValue } = tossCoinsDetailed()
    const newCoins = coinResults.map(v => v === 1 ? 'back' as const : 'front' as const)

    dispatch({ type: 'toss', coins: newCoins, resultValue: lineValue })

    if (!prefersReducedMotion) {
      coinRefs.current.forEach((coin, i) => {
        if (!coin) return
        gsap.fromTo(coin,
          { rotationY: 0, scale: 1 },
          { rotationY: 360, scale: 1.15, duration: 0.4, ease: "power2.inOut", transformPerspective: 400, delay: i * 0.05 }
        )
        gsap.to(coin, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)", delay: i * 0.05 + 0.4 })
      })
    }

    try { playAllLands() } catch { /* ignore */ }

    // Auto-advance: use postMessage which definitely fires in all environments
    window.postMessage({ type: 'coin-cast', lineValue }, '*')
  }, [currentIndex, state.phase, prefersReducedMotion])

  // Listen for postMessage to auto-advance
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'coin-cast' && mountedRef.current) {
        onCastRef.current(e.data.lineValue)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (currentIndex >= 6) return null
  const backCount = state.coins?.filter(c => c === 'back').length ?? 0
  const lineLabel = POSITION_NAMES[currentIndex] ?? ''
  const showResult = state.phase === 'result'

  return (
    <div className="text-center">
      <div className="space-y-4">
        <div className="text-sm text-stone-500">{lineLabel} · 第 {currentIndex + 1}/6 爻</div>
        <div ref={containerRef} className="flex justify-center gap-8 py-6">
          {[0, 1, 2].map((i) => {
            let symbol: string
            let coinClass: string
            if (state.phase === 'idle') {
              symbol = "文"
              coinClass = "border-stone-400 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-600 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            } else if (state.coins) {
              const isBack = state.coins[i] === 'back'
              symbol = isBack ? "背" : "字"
              coinClass = isBack
                ? "border-gold bg-gradient-to-b from-gold/30 to-bronze/20 text-bronze font-bold shadow-md"
                : "border-stone-400 bg-gradient-to-b from-stone-100 to-stone-200 text-ink-light"
            } else {
              symbol = "文"
              coinClass = "border-stone-400 bg-gradient-to-b from-stone-200 to-stone-300 text-stone-600"
            }
            return (
              <div key={i} ref={el => { coinRefs.current[i] = el }} data-testid="coin"
                className={"w-[4.5rem] h-[4.5rem] rounded-full border-2 flex items-center justify-center text-xl shadow-sm will-change-transform " + coinClass}
                onClick={state.phase === 'idle' ? handleToss : undefined}
                role="button" tabIndex={state.phase === 'idle' ? 0 : undefined}
                aria-label={state.resultValue ? (state.coins?.[i] === "back" ? "背" : "字") : "点击掷铜钱"}>
                {symbol}
              </div>
            )
          })}
        </div>
        <div className={`rounded-lg p-4 border shadow-sm mx-4 transition-opacity duration-300 min-h-[3.5rem] flex items-center justify-center ${
          showResult ? 'bg-white border-stone-200 visible opacity-100' : 'border-transparent invisible opacity-0'
        }`}>
          {showResult && state.resultValue !== null ? (
            <p className="text-ink">
              <span className="font-medium">{backCount} 背 {3 - backCount} 字</span>
              <span className="mx-2 text-stone-400">→</span>
              <span className="font-bold text-lg text-bronze">{state.resultValue}</span>
              <span className="text-sm ml-2 text-stone-500">{LINE_NAMES[state.resultValue]}</span>
            </p>
          ) : <span className="text-ink">&nbsp;</span>}
        </div>
        <p className="text-sm text-stone-400">
          {state.phase === 'idle' && (currentIndex === 0 ? "点击任意铜钱掷出" : `已完成 ${currentIndex}/6 爻，继续点击铜钱`)}
          {showResult && "结果已记录，准备下一爻..."}
        </p>
      </div>
    </div>
  )
}
