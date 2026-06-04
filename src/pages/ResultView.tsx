import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Interpretation from '../components/result/Interpretation'
import AIProgressIndicator from '../components/result/AIProgressIndicator'
import { getRecordById } from '../db/records.js'
import { useAIInterpretation } from '../hooks/useAIInterpretation'
import FeedbackForm from '../components/feedback/FeedbackForm'
import type { DivinationRecord } from '../types'

export default function ResultView() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<DivinationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false)
  const {
    progress,
    error: aiError,
    triggerDefault,
    triggerDeep,
    hasKey,
  } = useAIInterpretation()

  useEffect(() => {
    if (!id) return
    getRecordById(id)
      .then((r) => {
        setRecord(r)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (record && hasKey && record.interpretations.length === 0 && !loading && !hasAutoTriggered) {
      setHasAutoTriggered(true)
      triggerDefault(record)
    }
  }, [record, hasKey, loading, hasAutoTriggered, triggerDefault])

  useEffect(() => {
    if (record && progress === 'done') {
      getRecordById(record.id).then(setRecord)
    }
  }, [progress, record?.id])


  if (loading) return <div className="flex justify-center py-12 text-gray-400">加载中...</div>
  if (!record) return <div className="text-center py-12 text-gray-400">记录未找到</div>

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{record.question}</h2>
        <p className="text-sm text-gray-500">
          {record.category} · {new Date(record.timestamp).toLocaleString('zh-CN')}
        </p>
      </div>

      {record.beforeDivination && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <span className="font-medium text-yellow-800">占前预判：</span>
          {record.beforeDivination.userExpectation && (<span className="text-yellow-700">{record.beforeDivination.userExpectation}</span>)}
          {record.beforeDivination.userConfidence && (<span className="text-yellow-600 ml-2">信心 {record.beforeDivination.userConfidence}/5</span>)}
        </div>
      )}

      <AIProgressIndicator progress={progress} error={aiError} />

      <Interpretation record={record} />

      {/* AI trigger area */}
      {!loading && progress === 'idle' && (
        <div className="text-center space-y-2">
          {!hasKey && record.interpretations.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">请先在设置中配置 DeepSeek API Key</p>
              <Link to="/settings" className="mt-2 inline-block text-blue-600 hover:underline text-sm">前往设置 →</Link>
            </div>
          )}
          {hasKey && record.interpretations.length === 0 && !aiError && (
            <button
              onClick={() => { setHasAutoTriggered(true); triggerDefault(record) }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {hasAutoTriggered ? '重新获取 AI 解读' : '获取 AI 解读'}
            </button>
          )}
          {hasKey && record.interpretations.length === 0 && aiError && (
            <div className="space-y-3">
              <p className="text-red-600 text-sm">{aiError}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => triggerDefault(record)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">重试</button>
                <Link to="/settings" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">检查 API Key</Link>
              </div>
            </div>
          )}
          {hasKey && record.interpretations.length > 0 && !record.interpretations.some(it => it.type === 'deep') && (
            <button onClick={() => triggerDeep(record)} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
              深度分析 (deepseek-v4-pro)
            </button>
          )}
        </div>
      )}

      <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />
    </div>
  )
}
