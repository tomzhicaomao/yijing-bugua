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
    <div className="card-nothing">
      {label && <h3 className="text-sm font-medium text-nothing-text-secondary mb-3">{label}</h3>}
      <div className="space-y-1.5">
        {[...lines].reverse().map((value, i) => {
          const position = 6 - i
          const isChanging = value !== null && changingLinePositions.includes(position)

          return (
            <div
              key={position}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors
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
