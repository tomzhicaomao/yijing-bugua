import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecordById } from '../db/records.js'
import { useAuth } from '../auth/AuthContext'
import { useAIInterpretation } from '../hooks/useAIInterpretation'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Interpretation from '../components/result/Interpretation'
import AIProgressIndicator from '../components/result/AIProgressIndicator'
import FeedbackForm from '../components/feedback/FeedbackForm'
import type { DivinationRecord } from '../types'

export default function ResultView() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
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
    if (!id || !user) return
    getRecordById(id, user.id)
      .then((r) => {
        setRecord(r)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [id, user])

  useEffect(() => {
    if (record && hasKey && record.interpretations.length === 0 && !loading && !hasAutoTriggered) {
      setHasAutoTriggered(true)
      triggerDefault(record)
    }
  }, [record, hasKey, loading, hasAutoTriggered, triggerDefault])

  useEffect(() => {
    if (record && progress === 'done' && user) {
      getRecordById(record.id, user.id).then(setRecord)
    }
  }, [progress, record?.id, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian text-luxury-50 flex items-center justify-center">
        <p className="text-white/40">加载中...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-obsidian text-luxury-50 flex items-center justify-center">
        <p className="text-white/40">记录未找到</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-luxury-50">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white/40 hover:text-gold transition-colors">
            ← 返回
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-gold">结果</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 问题信息 */}
          <GlassCard className="p-6">
            <h2 className="font-display text-xl tracking-wide mb-2">{record.question}</h2>
            <p className="text-sm text-white/40">
              {record.category} · {new Date(record.timestamp).toLocaleString('zh-CN')}
            </p>
          </GlassCard>

          {/* 占前预判 */}
          {record.beforeDivination && (
            <GlassCard className="p-5 border-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gold text-sm">占前预判</span>
              </div>
              <div className="text-sm text-white/60 space-y-1">
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

          {/* AI 进度指示 */}
          <AIProgressIndicator progress={progress} error={aiError} />

          {/* 解读结果 */}
          <Interpretation record={record} />

          {/* AI 操作区 */}
          {!loading && (progress === 'idle' || progress === 'done') && (
            <div className="space-y-3">
              {!hasKey && record.interpretations.length === 0 && (
                <GlassCard className="p-4 border-gold/20">
                  <p className="text-sm text-white/60 mb-2">请先在设置中配置 DeepSeek API Key</p>
                  <Link to="/settings" className="text-gold hover:text-gold-light text-sm transition-colors">
                    前往设置 →
                  </Link>
                </GlassCard>
              )}

              {hasKey && record.interpretations.length === 0 && !aiError && (
                <Button
                  onClick={() => { setHasAutoTriggered(true); triggerDefault(record) }}
                  className="w-full py-3"
                >
                  {hasAutoTriggered ? '重新获取 AI 解读' : '获取 AI 解读'}
                </Button>
              )}

              {hasKey && record.interpretations.length === 0 && aiError && (
                <GlassCard className="p-4 border-red-500/20">
                  <p className="text-sm text-red-400 mb-3">{aiError}</p>
                  <div className="flex gap-3">
                    <Button onClick={() => triggerDefault(record)} className="flex-1 py-2 text-sm">
                      重试
                    </Button>
                    <Link to="/settings" className="flex-1">
                      <Button variant="ghost" className="w-full py-2 text-sm">
                        检查 API Key
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              )}

              {hasKey && record.interpretations.length > 0 && !record.interpretations.some(it => it.type === 'deep') && (
                <Button
                  variant="ghost"
                  onClick={() => triggerDeep(record)}
                  className="w-full py-3"
                >
                  深度分析 (deepseek-v4-pro)
                </Button>
              )}
            </div>
          )}

          {/* 反馈表单 */}
          <FeedbackForm record={record} onUpdated={(r) => setRecord(r)} />
        </div>
      </main>
    </div>
  )
}
