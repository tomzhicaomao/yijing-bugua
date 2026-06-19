import { useState } from 'react'
import { updateRecord } from '../../db/records.js'
import { useAuth } from '../../auth/AuthContext'
import { remindLater } from '../../lib/feedback-due.js'
import type { DivinationRecord, FeedbackStatus, ClaimFeedback } from '../../types'

interface FeedbackFormProps {
  record: DivinationRecord
  onUpdated: (r: DivinationRecord) => void
}

export default function FeedbackForm({ record, onUpdated }: FeedbackFormProps) {
  const { user } = useAuth()
  const [showDetail, setShowDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [actualResult, setActualResult] = useState(record.feedback.detail?.actualResult ?? '')
  const [satisfaction, setSatisfaction] = useState(record.feedback.detail?.satisfaction ?? 3)
  const [actualDuration, setActualDuration] = useState(record.feedback.detail?.actualDuration ?? 0)
  const [actionTaken, setActionTaken] = useState(record.feedback.detail?.actionTaken ?? '')
  const [aiInfluenced, setAiInfluenced] = useState<boolean | null>(record.feedback.detail?.aiInfluencedDecision ?? null)
  const [notes, setNotes] = useState(record.feedback.detail?.notes ?? '')
  const [claimFeedback, setClaimFeedback] = useState<ClaimFeedback[]>(record.feedback.detail?.claimFeedback ?? [])

  const allClaims = record.interpretations.flatMap(it => it.claims || [])

  const submitQuick = async (status: FeedbackStatus) => {
    if (!user) return
    setSubmitting(true)
    const updated = { ...record, feedback: { ...record.feedback, status } }
    await updateRecord(updated, user.id)
    onUpdated(updated)
    setSubmitting(false)
  }

  const submitDetail = async () => {
    if (!user) return
    setSubmitting(true)
    const detail = {
      actualResult: actualResult || undefined,
      satisfaction,
      actualDuration: actualDuration || undefined,
      actionTaken: actionTaken || undefined,
      aiInfluencedDecision: aiInfluenced ?? undefined,
      notes: notes || undefined,
      claimFeedback: claimFeedback.length > 0 ? claimFeedback : undefined,
    }
    const updated = { ...record, feedback: { ...record.feedback, detail } }
    await updateRecord(updated, user.id)
    onUpdated(updated)
    setShowDetail(false)
    setSubmitting(false)
  }

  const handleRemindLater = async () => {
    if (!user) return
    setSubmitting(true)
    const updated = { ...record, feedback: { ...record.feedback, dueAt: remindLater() } }
    await updateRecord(updated, user.id)
    onUpdated(updated)
    setSubmitting(false)
  }

  const isPending = record.feedback.status === 'pending'

  return (
    <div className="glass-card rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-medium text-white/60">反馈结果</h3>

      {!isPending && (
        <p className="text-sm">
          {record.feedback.status === 'accurate' ? '✅ 已反馈：准' :
           record.feedback.status === 'inaccurate' ? '❌ 已反馈：不准' :
           '❓ 已反馈：不清楚'}
        </p>
      )}

      <div className="flex gap-2">
        {isPending ? (
          <>
            <button onClick={() => submitQuick('accurate')} disabled={submitting} className="flex-1 py-3 bg-jade text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all">准</button>
            <button onClick={() => submitQuick('inaccurate')} disabled={submitting} className="flex-1 py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark disabled:opacity-50 transition-all">不准</button>
            <button onClick={() => submitQuick('unclear')} disabled={submitting} className="flex-1 py-3 bg-stone-500 text-white rounded-lg font-medium hover:bg-stone-600 disabled:opacity-50 transition-all">不清楚</button>
          </>
        ) : (
           <button onClick={() => submitQuick('pending')} disabled={submitting} className="px-4 py-2 text-sm bg-white/10 text-white/50 rounded-lg hover:bg-white/15 disabled:opacity-50 transition-colors">撤销反馈</button>
        )}
      </div>

      <div className="flex justify-between text-sm">
        <button onClick={() => setShowDetail(!showDetail)} className="text-gold hover:text-gold-light">
          {showDetail ? '收起详情' : (isPending ? '详细记录' : '编辑详情')}
        </button>
        {isPending && (
          <button onClick={handleRemindLater} disabled={submitting} className="text-white/40 hover:text-white/60 disabled:opacity-50">稍后提醒</button>
        )}
      </div>

      {showDetail && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div>
            <label className="block text-xs text-stone-500 mb-1">实际结果</label>
            <input type="text" className="input-luxury w-full p-2 text-sm" value={actualResult} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualResult(e.target.value)} placeholder="最终结果是什么？" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">满意度 ({satisfaction}/5)</label>
            <input type="range" min="1" max="5" value={satisfaction} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSatisfaction(+e.target.value)} className="w-full accent-gold" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">实际耗时（天）</label>
            <input type="number" className="input-luxury w-full p-2 text-sm" value={actualDuration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualDuration(+e.target.value)} min="0" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">实际行动</label>
            <input type="text" className="input-luxury w-full p-2 text-sm" value={actionTaken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionTaken(e.target.value)} placeholder="你实际做了什么？" />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">AI 是否影响了你的决策？</label>
            <div className="flex gap-4">
            <label className="text-sm text-white/60"><input type="radio" name="ai" checked={aiInfluenced===true} onChange={() => setAiInfluenced(true)} className="accent-gold" /> 是</label>
              <label className="text-sm text-white/60"><input type="radio" name="ai" checked={aiInfluenced===false} onChange={() => setAiInfluenced(false)} className="accent-gold" /> 否</label>
            </div>
          </div>

          {allClaims.length > 0 && (
            <div>
              <label className="block text-xs text-stone-500 mb-2">逐条判断反馈</label>
              {allClaims.map(c => {
                const cf = claimFeedback.find(f => f.claimId === c.id)
                const status = cf?.status ?? null
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/60 flex-1">{c.text}</span>
                    <div className="flex gap-1 shrink-0 ml-2">
                      {(['hit', 'miss', 'unclear'] as const).map(s => (
                        <button key={s}
                          onClick={() => {
                            const others = claimFeedback.filter(f => f.claimId !== c.id)
                            setClaimFeedback(status === s ? others : [...others, { claimId: c.id, status: s }])
                          }}
                          className={`text-xs px-2 py-0.5 rounded transition-colors ${status === s ? (s === 'hit' ? 'bg-green-500/20 text-green-400' : s === 'miss' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/50') : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                          {s === 'hit' ? '✓' : s === 'miss' ? '✗' : '?'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div>
            <label className="block text-xs text-stone-500 mb-1">备注</label>
            <input type="text" className="input-luxury w-full p-2 text-sm" value={notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} placeholder="其他想记录的..." />
          </div>

          <button onClick={submitDetail} disabled={submitting} className="w-full py-2.5 btn-gold text-sm rounded-lg disabled:opacity-50">
            {isPending ? '保存反馈详情' : '更新反馈详情'}
          </button>
        </div>
      )}

      {!showDetail && !isPending && record.feedback.detail && (
        <div className="text-xs text-stone-500 space-y-1 pt-1">
          {record.feedback.detail.actualResult && <p>结果：{record.feedback.detail.actualResult}</p>}
          {record.feedback.detail.satisfaction && <p>满意度：{record.feedback.detail.satisfaction}/5</p>}
        </div>
      )}
    </div>
  )
}
