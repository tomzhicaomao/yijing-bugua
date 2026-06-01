import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  const {
    progress,
    error: aiError,
    triggerDefault,
    triggerDeep,
    hasKey,
  } = useAIInterpretation()

  useEffect(() => {
    if (!id) return
    getRecordById(id).then((r) => {
      setRecord(r)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (record && hasKey && record.interpretations.length === 0 && !loading) {
      triggerDefault(record)
    }
  }, [record, hasKey, loading, triggerDefault])

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

      {hasKey && record.interpretations.length > 0 && !record.interpretations.some(it => it.type === 'deep') && progress !== 'reasoning' && progress !== 'narrative' && (
        <div className="text-center">
          <button onClick={() => triggerDeep(record)} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
            深度分析 (deepseek-v4-pro)
          </button>
          <p className="text-xs text-gray-400 mt-1">使用更强大的模型进行深度推理</p>
        </div>
      )}

      <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />
    </div>
  )
}
