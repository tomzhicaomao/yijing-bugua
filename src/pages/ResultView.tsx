import { useState, useEffect, useRef, useCallback } from 'react'
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
  const hasAutoTriggered = useRef(false)
  const [hasAutoTriggeredDisplay, setHasAutoTriggeredDisplay] = useState(false)
  const {
    progress,
    error: aiError,
    triggerDefault,
    triggerDeep,
    hasKey,
  } = useAIInterpretation()

  const handleTriggerDefault = useCallback(async (r: DivinationRecord) => {
    hasAutoTriggered.current = true
    setHasAutoTriggeredDisplay(true)
    const updated = await triggerDefault(r)
    if (updated) {
      setRecord(updated)
    }
  }, [triggerDefault])

  const handleTriggerDeep = useCallback(async (r: DivinationRecord) => {
    const updated = await triggerDeep(r)
    if (updated) {
      setRecord(updated)
    }
  }, [triggerDeep])

  // Fetch record on mount
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

  // Auto-trigger AI interpretation when ready
  useEffect(() => {
    if (record && hasKey && record.interpretations.length === 0 && !loading && !hasAutoTriggered.current) {
      handleTriggerDefault(record)
    }
  }, [record, hasKey, loading, handleTriggerDefault])

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
          <Link to="/" className="text-nothing-text-secondary hover:text-nothing-text-primary transition-colors">
            ← 返回
          </Link>
          <span className="text-lg tracking-[0.2em] text-nothing-text-display">结果</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-20 px-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* 问题信息 */}
          <GlassCard className="p-6">
            <h2 className="text-[24px] tracking-wide mb-2 text-nothing-text-display">{record.question}</h2>
            <p className="text-sm text-nothing-text-secondary">
              {record.category} · {new Date(record.timestamp).toLocaleString('zh-CN')}
            </p>
          </GlassCard>

          {/* 占前预判 */}
          {record.beforeDivination && (
            <GlassCard className="p-5 border border-nothing-accent-subtle">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-nothing-accent text-sm">占前预判</span>
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

          {/* AI 进度指示 */}
          <AIProgressIndicator progress={progress} error={aiError} />

          {/* 解读结果 */}
          <Interpretation record={record} />

          {/* AI 操作区 */}
          {(progress === 'idle' || progress === 'done' || progress === 'error') && (
            <div className="space-y-3">
              {/* 没有 API Key 且没有 AI 解读 */}
              {!hasKey && record.interpretations.length === 0 && (
                <GlassCard className="p-4 border border-nothing-accent-subtle">
                  <p className="text-sm text-nothing-text-secondary mb-2">获取 AI 深度解读需要配置 DeepSeek API Key</p>
                  <Link to="/settings" className="text-nothing-accent hover:text-nothing-text-display text-sm transition-colors">
                    前往设置 →
                  </Link>
                </GlassCard>
              )}

              {/* 有 API Key 且没有 AI 解读且无错误 */}
              {hasKey && record.interpretations.length === 0 && !aiError && (
                <Button
                  onClick={() => handleTriggerDefault(record)}
                  className="w-full py-3"
                >
                  {hasAutoTriggeredDisplay ? '重新获取 AI 解读' : '获取 AI 解读'}
                </Button>
              )}

              {/* 有 API Key 且有错误 */}
              {hasKey && record.interpretations.length === 0 && aiError && (
                <GlassCard className="p-4 border-red-500/20">
                  <p className="text-sm text-nothing-accent mb-3">{aiError}</p>
                  <div className="flex gap-3">
                    <Button onClick={() => handleTriggerDefault(record)} className="flex-1 py-2 text-sm">
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

              {/* 已有解读，可以获取深度分析 */}
              {hasKey && record.interpretations.length > 0 && !record.interpretations.some(it => it.type === 'deep') && (
                <Button
                  variant="ghost"
                  onClick={() => handleTriggerDeep(record)}
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
        <div className="h-16" />
      </main>

  </div>
);
}
