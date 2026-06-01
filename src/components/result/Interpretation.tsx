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
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{hexagram?.name}</span>
          <span className="text-gray-500">{hexagram?.trigramLower}{hexagram?.trigramUpper}</span>
        </div>

        {changed && (
          <div className="flex items-baseline gap-2 text-orange-600">
            <span className="text-sm">→ 变卦</span>
            <span className="text-xl font-bold">{changed.name}</span>
            <span>{changed.trigramLower}{changed.trigramUpper}</span>
          </div>
        )}

        {record.hexagram.changingLines.length > 0 && (
          <p className="text-sm text-orange-600">
            动爻：第 {record.hexagram.changingLines.join('、')} 爻
          </p>
        )}
      </div>

      {/* Judgment / Line text */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">卦辞</h3>
        <p className="text-gray-900 leading-relaxed">{hexagram?.judgment}</p>
        <p className="text-sm text-gray-500 mt-1">{hexagram?.judgmentModern}</p>
      </div>

      {lineResult.type === 'lines' && (
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            爻辞
            {lineResult.allMoving && <span className="text-orange-500 ml-1">· 六爻皆动</span>}
          </h3>
          {Array.isArray(lineResult.text) && lineResult.text.map((t, i) => (
            <p key={i} className="text-gray-900 leading-relaxed mb-2">{t}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function AIInterpretation({ interpretation }: { interpretation: IResult }) {
  return (
    <div className="border border-blue-200 rounded-lg p-4 space-y-4 bg-blue-50/30">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
          {interpretation.type === 'deep' ? '深度分析' : 'AI 解读'}
        </span>
        <span className="text-xs text-gray-400">{interpretation.model}</span>
      </div>

      <div>
        <span className={`inline-block px-2 py-1 rounded text-sm font-bold bg-white border ${
          interpretation.trend === '利' ? 'text-green-700 border-green-300' :
          interpretation.trend === '不利' ? 'text-red-700 border-red-300' :
          'text-gray-700 border-gray-300'
        }`}>
          趋势：{interpretation.trend}
        </span>
        <span className="text-xs text-gray-400 ml-2">置信度：{interpretation.confidence}</span>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">分析</h4>
        <p className="text-gray-900 leading-relaxed">{interpretation.analysis}</p>
      </div>

      {interpretation.conditions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">核心条件</h4>
          <ul className="list-disc list-inside text-gray-900">
            {interpretation.conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">时间窗口</h4>
        <p className="text-gray-900">{interpretation.timeWindow}</p>
      </div>

      <div className="border-t border-blue-200 pt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">综合判断</h4>
        <p className="text-gray-900 font-medium">{interpretation.answer}</p>
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
        <div className="text-center text-gray-400 py-4">
          <p>暂无 AI 解读</p>
          <p className="text-sm">请先在设置页面配置 DeepSeek API Key</p>
        </div>
      )}
    </div>
  )
}
