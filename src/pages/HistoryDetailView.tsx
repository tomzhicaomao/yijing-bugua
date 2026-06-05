import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRecordById } from '../db/records.js'
import Interpretation from '../components/result/Interpretation'
import type { DivinationRecord } from '../types'
import FeedbackForm from '../components/feedback/FeedbackForm'

export default function HistoryDetailView() {
  const { id } = useParams<{ id: string }>()
  const [record, setRecord] = useState<DivinationRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getRecordById(id).then((r) => {
      setRecord(r)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div className="flex justify-center py-12 text-stone-400">加载中...</div>
  }

  if (!record) {
    return <div className="text-center py-12 text-stone-400">记录未找到</div>
  }

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">{record.question}</h2>
        <p className="text-sm text-stone-500 mt-1">
          {record.category} · {new Date(record.timestamp).toLocaleString('zh-CN')} · {record.method === 'virtual' ? '虚拟摇卦' : '手动输入'}
        </p>
      </div>

      {record.beforeDivination && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1 text-sm">
          <span className="font-medium text-amber-800">占前记录</span>
          {record.beforeDivination.userExpectation && (
            <p className="text-amber-700">预判：{record.beforeDivination.userExpectation}</p>
          )}
          {record.beforeDivination.userConfidence && (
            <p className="text-amber-600">信心：{record.beforeDivination.userConfidence}/5</p>
          )}
          {record.beforeDivination.intendedAction && (
            <p className="text-amber-700">计划行动：{record.beforeDivination.intendedAction}</p>
          )}
        </div>
      )}

      <Interpretation record={record} />

      <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />

      {record.feedback.detail && (
        <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-2 shadow-sm">
          <h3 className="text-sm font-medium text-ink-light">反馈详情</h3>
          {record.feedback.detail.actualResult && (
            <p className="text-sm"><span className="text-stone-500">实际结果：</span><span className="text-ink">{record.feedback.detail.actualResult}</span></p>
          )}
          {record.feedback.detail.satisfaction && (
            <p className="text-sm"><span className="text-stone-500">满意度：</span><span className="text-ink">{record.feedback.detail.satisfaction}/5</span></p>
          )}
          {record.feedback.detail.actualDuration && (
            <p className="text-sm"><span className="text-stone-500">实际耗时：</span><span className="text-ink">{record.feedback.detail.actualDuration} 天</span></p>
          )}
          {record.feedback.detail.actionTaken && (
            <p className="text-sm"><span className="text-stone-500">实际行动：</span><span className="text-ink">{record.feedback.detail.actionTaken}</span></p>
          )}
          {record.feedback.detail.notes && (
            <p className="text-sm"><span className="text-stone-500">备注：</span><span className="text-ink">{record.feedback.detail.notes}</span></p>
          )}
          {record.feedback.detail.aiInfluencedDecision !== undefined && (
            <p className="text-sm">
              <span className="text-stone-500">AI 是否影响决策：</span>
              <span className="text-ink">{record.feedback.detail.aiInfluencedDecision ? '是' : '否'}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
