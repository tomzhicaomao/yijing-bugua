import { lookupHexagram, getLineText } from '../../engine/hexagram-lookup.js'
import type { InterpretationResult as IResult, DivinationRecord } from '../../types'

interface InterpretationProps {
  record: DivinationRecord
}

function RuleEngineResult({ record }: { record: DivinationRecord }) {
  const hexagram = lookupHexagram(record.hexagram.original)
  const changed = record.hexagram.changed ? lookupHexagram(record.hexagram.changed) : null
  const mutual = record.hexagram.mutual ? lookupHexagram(record.hexagram.mutual) : null
  const lineResult = getLineText(record.hexagram.original, record.hexagram.changingLines)

  return (
    <div className="space-y-4">
      {/* Hexagram info */}
      <div className="card-nothing space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-nothing-text-display">{hexagram?.name}</span>
          <span className="text-nothing-text-secondary">{hexagram?.trigramLower}{hexagram?.trigramUpper}</span>
        </div>

        {changed && (
          <div className="flex items-baseline gap-2 text-nothing-accent">
            <span className="text-sm">→ 变卦（之卦）</span>
            <span className="text-xl font-bold">{changed.name}</span>
            <span className="text-nothing-text-secondary">{changed.trigramLower}{changed.trigramUpper}</span>
          </div>
        )}

        {mutual && (
          <div className="flex items-baseline gap-2 text-nothing-text-primary">
            <span className="text-sm">互卦</span>
            <span className="text-xl font-bold">{mutual.name}</span>
            <span className="text-nothing-text-secondary">{mutual.trigramLower}{mutual.trigramUpper}</span>
          </div>
        )}

        {record.hexagram.changingLines.length > 0 && (
          <p className="text-sm text-nothing-accent">
            动爻：第 {record.hexagram.changingLines.join('、')} 爻
          </p>
        )}
      </div>

      {/* Judgment / Line text */}
      <div className="card-nothing">
        <h3 className="text-xs font-medium text-nothing-text-secondary mb-2 uppercase tracking-wider">卦辞</h3>
        <p className="text-nothing-text-primary leading-relaxed">{hexagram?.judgment}</p>
        <p className="text-sm text-nothing-text-secondary mt-2 leading-relaxed">{hexagram?.judgmentModern}</p>
      </div>

      {lineResult.type === 'lines' && (
        <div className="card-nothing">
          <h3 className="text-xs font-medium text-nothing-text-secondary mb-2 uppercase tracking-wider">
            爻辞
            {lineResult.allMoving && <span className="text-nothing-accent ml-1 normal-case">· 六爻皆动</span>}
          </h3>
          {Array.isArray(lineResult.text) && lineResult.text.map((t, i) => (
            <p key={i} className="text-nothing-text-primary leading-relaxed mb-2">{t}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function AIInterpretation({ interpretation }: { interpretation: IResult }) {
  return (
    <div className="border border-nothing-border rounded-lg p-5 space-y-4 bg-nothing-surface">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-nothing-accent-subtle text-nothing-accent px-2.5 py-0.5 rounded font-medium">
          {interpretation.type === 'deep' ? '深度分析' : 'AI 解读'}
        </span>
        <span className="text-xs text-nothing-text-secondary">{interpretation.model}</span>
      </div>

      <div>
        <span className={`inline-block px-2.5 py-1 rounded text-sm font-bold border ${
          interpretation.trend === '利' ? 'text-green-700 border-green-200 bg-green-50' :
          interpretation.trend === '不利' ? 'text-red-700 border-red-200 bg-red-50' :
          'text-nothing-text-secondary border-nothing-border bg-nothing-raised'
        }`}>
          趋势：{interpretation.trend}
        </span>
        <span className="text-xs text-nothing-text-secondary ml-2">置信度：{interpretation.confidence}</span>
      </div>

      <div>
        <h4 className="text-sm font-medium text-nothing-text-secondary mb-1">分析</h4>
        <p className="text-nothing-text-primary leading-relaxed">{interpretation.analysis}</p>
      </div>

      {interpretation.conditions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-nothing-text-secondary mb-1">核心条件</h4>
          <ul className="list-disc list-inside text-nothing-text-primary space-y-0.5">
            {interpretation.conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-nothing-text-secondary mb-1">时间窗口</h4>
        <p className="text-nothing-text-primary">{interpretation.timeWindow}</p>
      </div>

      <div className="border-t border-nothing-border pt-3">
        <h4 className="text-sm font-medium text-nothing-text-secondary mb-1">综合判断</h4>
        <p className="text-nothing-text-primary font-medium">{interpretation.answer}</p>
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
      <div className="text-center text-nothing-text-secondary py-6">
          <p>暂无 AI 解读</p>
          <p className="text-sm mt-1">请先在设置页面配置 DeepSeek API Key</p>
        </div>
      )}
    </div>
  )
}
