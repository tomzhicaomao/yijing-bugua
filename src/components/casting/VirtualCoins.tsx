import { useState, useCallback } from "react"
import { tossCoinsDetailed } from "../../engine/casting.js"
import type { LineValue } from "../../types"

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

  const handleToss = useCallback(() => {
    if (currentIndex >= 6 || phase !== "idle") return

    setPhase("flipping")
    setCoins(null)
    setResultValue(null)

    setTimeout(() => {
      const { coinResults, lineValue } = tossCoinsDetailed()
      setCoins(coinResults.map(v => v === 1 ? 'back' as const : 'front' as const))
      setResultValue(lineValue)
      setPhase("result")
    }, 500)
  }, [currentIndex, phase, onCast])

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
      <div className="text-sm text-gray-500">
        {lineLabel} · 第 {currentIndex + 1}/6 爻
      </div>

      {/* Three coins */}
      <div className="flex justify-center gap-6 py-6">
        {[0, 1, 2].map((i) => {
          let symbol: string
          let coinClass: string

          if (phase === "idle") {
            symbol = "🪙"
            coinClass = "border-gray-300 bg-white text-gray-400"
          } else if (phase === "flipping") {
            symbol = "…"
            coinClass = "border-amber-400 bg-amber-50 animate-pulse scale-110"
          } else if (coins) {
            const isBack = coins[i] === 'back'
            symbol = isBack ? "背" : "字"
            coinClass = isBack
              ? "border-amber-500 bg-amber-100 text-amber-800 font-bold"
              : "border-blue-300 bg-blue-50 text-blue-700"
          } else {
            symbol = "○"
            coinClass = "border-gray-300 bg-gray-50"
          }

          return (
            <div
              key={i}
              className={"w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 shadow-sm " + coinClass}
              aria-label={phase === "result" ? (coins?.[i] === "back" ? "背" : "字") : "铜钱"}
            >
              {symbol}
            </div>
          )
        })}
      </div>

      {/* Result display */}
      {phase === "result" && resultValue !== null && (
        <div className="space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200 animate-fade-in">
          <p className="text-gray-800">
            <span className="font-medium">{backCount} 背 {3 - backCount} 字</span>
            <span className="mx-2">→</span>
            <span className="font-bold text-lg text-amber-700">{resultValue}</span>
            <span className="text-sm ml-2 text-gray-500">{LINE_NAMES[resultValue]}</span>
          </p>
          <button
            onClick={confirmResult}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            确认此爻
          </button>
        </div>
      )}

      {/* Toss button */}
      {phase === "idle" && (
        <button
          onClick={handleToss}
          className="px-8 py-3 bg-amber-600 text-white rounded-lg font-medium text-lg hover:bg-amber-700 shadow-lg active:scale-95 transition-all"
        >
          {currentIndex === 0 ? "掷铜钱" : "再掷一次"}
        </button>
      )}

      <p className="text-sm text-gray-400">
        {phase === "idle" && (currentIndex === 0 ? "点击按钮掷出三枚铜钱" : `已完成 ${currentIndex}/6 爻`)}
        {phase === "flipping" && "铜钱落地中..."}
        {phase === "result" && "查看结果后点击确认"}
      </p>
    </div>
  )
}
