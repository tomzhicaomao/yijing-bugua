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
    <div className="bg-gray-50 rounded-lg p-4">
      {label && <h3 className="text-sm font-medium text-gray-600 mb-3">{label}</h3>}
      <div className="space-y-2">
        {[...lines].reverse().map((value, i) => {
          const position = 6 - i // 上爻(6) to 初爻(1)
          const isChanging = value !== null && changingLinePositions.includes(position)

          return (
            <div
              key={position}
              className={`flex items-center gap-3 p-2 rounded border transition-colors
                ${isChanging ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}
                ${value === null ? 'opacity-30' : ''}`}
            >
              <span className="text-xs text-gray-500 w-8 text-right">
                {POSITION_NAMES[position - 1]}爻
              </span>
              <span className="text-lg font-mono">
                {value !== null ? LINE_LABELS[value] : '···'}
              </span>
              {isChanging && (
                <span className="text-xs text-orange-600 font-medium">动</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
