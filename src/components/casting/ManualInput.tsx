import type { LineValue } from '../../types'

interface ManualInputProps {
  lines: (LineValue | null)[]
  currentIndex: number
  onSelectBack: (count: number) => void
  onComplete: () => void | Promise<void>
}

const BACK_OPTIONS = [
  { count: 0, label: '0 背', desc: '三个字', value: 6 as LineValue },
  { count: 1, label: '1 背', desc: '一背二字', value: 7 as LineValue },
  { count: 2, label: '2 背', desc: '二背一字', value: 8 as LineValue },
  { count: 3, label: '3 背', desc: '三个背', value: 9 as LineValue },
]

const POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']

export default function ManualInput({
  currentIndex,
  onSelectBack,
  onComplete,
}: ManualInputProps) {
  const isComplete = currentIndex >= 6

  if (isComplete) {
    return (
      <div className="text-center py-6">
        <p className="text-jade font-medium mb-4">六爻已全部输入</p>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark shadow-md transition-all"
        >
          完成起卦
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink">
          第 {currentIndex + 1} 爻 · {POSITION_NAMES[currentIndex]}
        </h3>
        <span className="text-sm text-stone-500">
          {currentIndex}/6 已输入
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-parchment-dark rounded-full h-2">
        <div
          className="bg-vermillion h-2 rounded-full transition-all"
          style={{ width: `${(currentIndex / 6) * 100}%` }}
        />
      </div>

      {/* Back count selector */}
      <div className="grid grid-cols-4 gap-2">
        {BACK_OPTIONS.map((opt) => (
          <button
            key={opt.count}
            onClick={() => onSelectBack(opt.count)}
            className="flex flex-col items-center py-3 px-2 border border-stone-300 rounded-lg bg-white hover:border-vermillion/50 hover:bg-parchment transition-all"
          >
            <span className="text-lg font-bold text-ink">{opt.label}</span>
            <span className="text-xs text-stone-500">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
