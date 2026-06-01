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
    return <div className="flex justify-center py-12 text-gray-400">加载中...</div>
  }

  if (!record) {
    return <div className="text-center py-12 text-gray-400">记录未找到</div>
  }

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{record.question}</h2>
        <p className="text-sm text-gray-500">
          {record.category} · {new Date(record.timestamp).toLocaleString('zh-CN')} · {record.method === 'virtual' ? '虚拟摇卦' : '手动输入'}
        </p>
      </div>

      {record.beforeDivination && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-1 text-sm">
          <span className="font-medium text-yellow-800">占前记录</span>
          {record.beforeDivination.userExpectation && (
            <p className="text-yellow-700">预判：{record.beforeDivination.userExpectation}</p>
          )}
          {record.beforeDivination.userConfidence && (
            <p className="text-yellow-600">信心：{record.beforeDivination.userConfidence}/5</p>
          )}
          {record.beforeDivination.intendedAction && (
            <p className="text-yellow-700">计划行动：{record.beforeDivination.intendedAction}</p>
          )}
        </div>
      )}

      <Interpretation record={record} />

      <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />

      {record.feedback.detail && (
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">反馈详情</h3>
          {record.feedback.detail.actualResult && (
            <p className="text-sm"><span className="text-gray-500">实际结果：</span>{record.feedback.detail.actualResult}</p>
          )}
          {record.feedback.detail.satisfaction && (
            <p className="text-sm"><span className="text-gray-500">满意度：</span>{record.feedback.detail.satisfaction}/5</p>
          )}
          {record.feedback.detail.actualDuration && (
            <p className="text-sm"><span className="text-gray-500">实际耗时：</span>{record.feedback.detail.actualDuration} 天</p>
          )}
          {record.feedback.detail.actionTaken && (
            <p className="text-sm"><span className="text-gray-500">实际行动：</span>{record.feedback.detail.actionTaken}</p>
          )}
          {record.feedback.detail.notes && (
            <p className="text-sm"><span className="text-gray-500">备注：</span>{record.feedback.detail.notes}</p>
          )}
          {record.feedback.detail.aiInfluencedDecision !== undefined && (
            <p className="text-sm">
              <span className="text-gray-500">AI 是否影响决策：</span>
              {record.feedback.detail.aiInfluencedDecision ? '是' : '否'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
