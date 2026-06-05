import type { BeforeDivination as BeforeDivinationData } from '../../types'

interface BeforeDivinationProps {
  data: BeforeDivinationData
  onChange: (d: BeforeDivinationData) => void
  onNext: () => void
  onSkip: () => void
}

export default function BeforeDivination({ data, onChange, onNext, onSkip }: BeforeDivinationProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-ink">起卦前，记录你的判断</h2>
        <p className="text-sm text-stone-500 mt-1">（全部可选，跳过即可）</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-light mb-1">
          你的预判
        </label>
        <input
          type="text"
          className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
          placeholder="你觉得结果会是怎样的？"
          value={data.userExpectation ?? ''}
          onChange={(e) => onChange({ ...data, userExpectation: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-light mb-1">
          信心程度 (1-5)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ ...data, userConfidence: n })}
              className={`w-10 h-10 rounded-lg border font-medium transition-all
                ${data.userConfidence === n
                  ? 'bg-vermillion text-white border-vermillion shadow-sm'
                  : 'bg-white text-ink-light border-stone-300 hover:border-vermillion/40'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-light mb-1">
          原本打算采取的行动
        </label>
        <input
          type="text"
          className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
          placeholder="你想怎么做？（可选）"
          value={data.intendedAction ?? ''}
          onChange={(e) => onChange({ ...data, intendedAction: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark shadow-md transition-all"
        >
          保存并继续
        </button>
        <button
          onClick={onSkip}
          className="py-3 px-4 text-stone-500 text-sm border border-stone-300 rounded-lg hover:bg-parchment hover:text-ink-light transition-colors"
        >
          跳过
        </button>
      </div>
    </div>
  )
}
