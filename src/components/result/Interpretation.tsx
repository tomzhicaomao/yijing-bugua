import { lookupHexagram, getLineText } from '../../engine/hexagram-lookup.js'
import type { InterpretationResult as IResult, DivinationRecord } from '../../types'

interface InterpretationProps {
  record: DivinationRecord
}

function RuleEngineResult({ record }: { record: DivinationRecord }) {
  const hexagram = lookupHexagram(record.hexagram.original)
  const changed = record.hexagram.changed ? lookupHexagram(record.hexagram.changed) : null
  const lineResult = getLineText(record.hexagram.original, record.hexagram.changingLines)

  return (
    <div className="space-y-4">
      {/* Hexagram info */}
      <div className="bg-stone-800 rounded-lg p-5 space-y-2 text-stone-200">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gold">{hexagram?.name}</span>
          <span className="text-stone-400">{hexagram?.trigramLower}{hexagram?.trigramUpper}</span>
        </div>

        {changed && (
          <div className="flex items-baseline gap-2 text-vermillion">
            <span className="text-sm">→ 变卦</span>
            <span className="text-xl font-bold">{changed.name}</span>
            <span className="text-stone-400">{changed.trigramLower}{changed.trigramUpper}</span>
          </div>
        )}

        {record.hexagram.changingLines.length > 0 && (
          <p className="text-sm text-bronze">
            动爻：第 {record.hexagram.changingLines.join('、')} 爻
          </p>
        )}
      </div>

      {/* Judgment / Line text */}
      <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
        <h3 className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">卦辞</h3>
        <p className="text-ink leading-relaxed">{hexagram?.judgment}</p>
        <p className="text-sm text-stone-500 mt-2 leading-relaxed">{hexagram?.judgmentModern}</p>
      </div>

      {lineResult.type === 'lines' && (
        <div className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm">
          <h3 className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wider">
            爻辞
            {lineResult.allMoving && <span className="text-vermillion ml-1 normal-case">· 六爻皆动</span>}
          </h3>
          {Array.isArray(lineResult.text) && lineResult.text.map((t, i) => (
            <p key={i} className="text-ink leading-relaxed mb-2">{t}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function AIInterpretation({ interpretation }: { interpretation: IResult }) {
  return (
    <div className="border border-bronze/30 rounded-lg p-5 space-y-4 bg-parchment shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-bronze/15 text-bronze px-2.5 py-0.5 rounded font-medium">
          {interpretation.type === 'deep' ? '深度分析' : 'AI 解读'}
        </span>
        <span className="text-xs text-stone-400">{interpretation.model}</span>
      </div>

      <div>
        <span className={`inline-block px-2.5 py-1 rounded text-sm font-bold bg-white border ${
          interpretation.trend === '利' ? 'text-jade border-jade/30' :
          interpretation.trend === '不利' ? 'text-vermillion border-vermillion/30' :
          'text-stone-600 border-stone-300'
        }`}>
          趋势：{interpretation.trend}
        </span>
        <span className="text-xs text-stone-400 ml-2">置信度：{interpretation.confidence}</span>
      </div>

      <div>
        <h4 className="text-sm font-medium text-ink-light mb-1">分析</h4>
        <p className="text-ink leading-relaxed">{interpretation.analysis}</p>
      </div>

      {interpretation.conditions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-ink-light mb-1">核心条件</h4>
          <ul className="list-disc list-inside text-ink space-y-0.5">
            {interpretation.conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-ink-light mb-1">时间窗口</h4>
        <p className="text-ink">{interpretation.timeWindow}</p>
      </div>

      <div className="border-t border-bronze/20 pt-3">
        <h4 className="text-sm font-medium text-ink-light mb-1">综合判断</h4>
        <p className="text-ink font-medium">{interpretation.answer}</p>
      </div>
    </div>
  )
}

export default function Interpretation({ record }: InterpretationProps) {
  return (
    <div className="space-y-6">
      <RuleEngineResult record={record} />
      {record.interpretations.map((interp) => (
        <AIInterpretation key={interp.id} interpretation={interp} />
      ))}
      {record.interpretations.length === 0 && (
        <div className="text-center text-stone-400 py-6">
          <p>暂无 AI 解读</p>
          <p className="text-sm mt-1">请先在设置页面配置 DeepSeek API Key</p>
        </div>
      )}
    </div>
  )
}
