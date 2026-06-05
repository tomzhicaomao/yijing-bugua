import type { Category } from '../../types'
import { CATEGORIES } from '../../lib/constants'

interface QuestionInputProps {
  question: string
  category: Category | null
  onQuestionChange: (q: string) => void
  onCategoryChange: (c: Category) => void
  onNext: () => void
}

const CATEGORY_LABELS: Record<Category, string> = {
  '工作': '🏢 工作',
  '人际': '👥 人际',
  '财务': '💰 财务',
  '健康': '💊 健康',
  '其他': '📋 其他',
}

export default function QuestionInput({
  question,
  category,
  onQuestionChange,
  onCategoryChange,
  onNext,
}: QuestionInputProps) {
  const canProceed = question.trim().length > 0 && category !== null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-ink">你想问什么？</h2>

      <div>
        <label className="block text-sm font-medium text-ink-light mb-2">
          你的问题
        </label>
        <textarea
          className="w-full border border-stone-300 rounded-lg p-3 h-28 resize-none bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion"
          placeholder="例如：跟老板谈加薪能成吗？"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-light mb-2">
          问题分类
        </label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`py-2 px-2 rounded-lg text-sm font-medium border transition-colors
                ${category === cat
                  ? 'bg-vermillion text-white border-vermillion'
                  : 'bg-white text-ink-light border-stone-300 hover:border-vermillion/40 hover:bg-parchment'
                }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full py-3 rounded-lg font-medium transition-all
          ${canProceed
            ? 'bg-vermillion text-white hover:bg-vermillion-dark shadow-md hover:shadow-lg'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
      >
        下一步
      </button>
    </div>
  )
}
