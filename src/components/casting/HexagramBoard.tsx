import type { LineValue } from '../../types'

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
  return (
    <div className="bg-stone-800 rounded-lg p-5 shadow-inner">
      {label && <h3 className="text-sm font-medium text-stone-400 mb-3">{label}</h3>}
      <div className="space-y-1.5">
        {[...lines].reverse().map((value, i) => {
          const position = 6 - i
          const isChanging = value !== null && changingLinePositions.includes(position)

          return (
            <div
              key={position}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors
                ${isChanging ? 'bg-vermillion/20 border border-vermillion/40' : 'border border-stone-700'}
                ${value === null ? 'opacity-30' : ''}`}
            >
              <span className="text-xs text-stone-500 w-8 text-right">
                {POSITION_NAMES[position - 1]}爻
              </span>
              <span className="text-lg text-stone-200 tracking-wider">
                {value !== null ? LINE_LABELS[value] : '···'}
              </span>
              {isChanging && (
                <span className="text-xs text-vermillion font-medium ml-auto">动</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
