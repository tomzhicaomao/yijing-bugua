import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecordById } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Interpretation from '../components/result/Interpretation'
import FeedbackForm from '../components/feedback/FeedbackForm'
import type { DivinationRecord } from '../types'

export default function HistoryDetailView() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [record, setRecord] = useState<DivinationRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    getRecordById(id, user.id).then((r) => {
      setRecord(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <p className="text-nothing-text-secondary">加载中...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <p className="text-nothing-text-secondary">记录未找到</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-nothing-bg border-b border-nothing-border">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/history" className="text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">
            ← 返回
          </Link>
          <span className="text-lg tracking-[0.2em] text-nothing-text-display">详情</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-28 px-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 问题信息 */}
          <GlassCard className="p-6">
            <h2 className="text-[24px] tracking-wide mb-2 text-nothing-text-display">{record.question}</h2>
            <div className="flex items-center gap-3 text-sm text-nothing-text-secondary">
              <span>{record.category}</span>
              <span className="text-nothing-text-disabled">·</span>
              <span>{new Date(record.timestamp).toLocaleString('zh-CN')}</span>
              <span className="text-nothing-text-disabled">·</span>
              <span>{record.method === 'virtual' ? '虚拟摇卦' : '手动输入'}</span>
            </div>
          </GlassCard>

          {/* 占前预判 */}
          {record.beforeDivination && (
            <GlassCard className="p-5 border border-nothing-accent-subtle">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-nothing-accent text-sm">占前记录</span>
              </div>
              <div className="text-sm text-nothing-text-secondary space-y-1">
                {record.beforeDivination.userExpectation && (
                  <p>预判：{record.beforeDivination.userExpectation}</p>
                )}
                {record.beforeDivination.userConfidence && (
                  <p>信心：{record.beforeDivination.userConfidence}/5</p>
                )}
                {record.beforeDivination.intendedAction && (
                  <p>计划行动：{record.beforeDivination.intendedAction}</p>
                )}
              </div>
            </GlassCard>
          )}

          {/* 解读结果 */}
          <Interpretation record={record} />

          {/* 反馈表单 */}
          <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />

          {/* 反馈详情 */}
          {record.feedback.detail && (
            <GlassCard className="p-5">
              <h3 className="text-sm text-nothing-text-secondary mb-3">反馈详情</h3>
              <div className="text-sm text-nothing-text-secondary space-y-2">
                {record.feedback.detail.actualResult && (
                  <p>实际结果：{record.feedback.detail.actualResult}</p>
                )}
                {record.feedback.detail.satisfaction && (
                  <p>满意度：{record.feedback.detail.satisfaction}/5</p>
                )}
                {record.feedback.detail.actualDuration && (
                  <p>实际耗时：{record.feedback.detail.actualDuration} 天</p>
                )}
                {record.feedback.detail.actionTaken && (
                  <p>实际行动：{record.feedback.detail.actionTaken}</p>
                )}
                {record.feedback.detail.notes && (
                  <p>备注：{record.feedback.detail.notes}</p>
                )}
                {record.feedback.detail.aiInfluencedDecision !== undefined && (
                  <p>AI 是否影响决策：{record.feedback.detail.aiInfluencedDecision ? '是' : '否'}</p>
                )}
              </div>
            </GlassCard>
          )}
        </div>
          <div className="h-24" />
    </main>

    {/* Bottom nav */}
    <nav className="fixed bottom-0 left-0 right-0 border-t border-nothing-border bg-nothing-bg">
      <div className="max-w-md mx-auto flex justify-around py-3">
        <Link to="/" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">HOME</Link>
        <Link to="/divine" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">DIVINE</Link>
        <Link to="/history" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">HISTORY</Link>
        <Link to="/stats" className="font-mono text-[10px] tracking-[0.1em] text-nothing-text-disabled hover:text-nothing-text-primary transition-colors">STATS</Link>
      </div>
    </nav>
  </div>
);
}
