import { useState, useEffect, useRef } from "react"
import { queryPendingDue, updateRecord } from "../../db/records.js"
import { remindLater } from "../../lib/feedback-due.js"
import { useAuth } from "../../auth/AuthContext"
import { gsap } from "../../lib/gsap.js"
import type { DivinationRecord, FeedbackStatus, FeedbackDetail } from "../../types"

interface FeedbackListProps { onAllDone: () => void }

export default function FeedbackList({ onAllDone }: FeedbackListProps) {
  const { user } = useAuth()
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    queryPendingDue(user.id).then((r) => {
      setRecords(r)
      setLoaded(true)
      if (r.length === 0) onAllDone()
    })
  }, [onAllDone, user])

  // Animate modal entrance
  useEffect(() => {
    if (!modalRef.current || !loaded || records.length === 0) return
    
    gsap.from(modalRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.4,
      ease: "back.out(1.7)",
    })
  }, [loaded, records.length, currentIdx])

  const advance = () => {
    const next = currentIdx + 1
    if (next >= records.length) { onAllDone(); return }
    setCurrentIdx(next)
    setShowDetail(false)
  }

  const handleStatus = async (status: FeedbackStatus): Promise<void> => {
    if (!user) return
    const record = records[currentIdx]
    if (!record) return
    await updateRecord({ ...record, feedback: { ...record.feedback, status } }, user.id)
    advance()
  }

  const handleRemind = async (): Promise<void> => {
    if (!user) return
    const record = records[currentIdx]
    if (!record) return
    await updateRecord({ ...record, feedback: { ...record.feedback, dueAt: remindLater() } }, user.id)
    advance()
  }

  if (!loaded || records.length === 0) return null

  const r = records[currentIdx]
  if (!r) return null

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-charcoal border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-semibold text-luxury-50">该反馈了</h3>
        <p className="text-white/60">{r.question}</p>
        <p className="text-sm text-white/40">{new Date(r.timestamp).toLocaleDateString("zh-CN")} · {r.category}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => handleStatus("accurate")} className="px-6 py-3 bg-jade text-white rounded-lg font-medium hover:opacity-90 transition-all">准</button>
          <button onClick={() => handleStatus("inaccurate")} className="px-6 py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark transition-all">不准</button>
          <button onClick={() => handleStatus("unclear")} className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all">不清楚</button>
        </div>
        <div className="flex justify-between text-sm">
          <button onClick={() => setShowDetail(!showDetail)} className="text-gold hover:text-gold-light">{showDetail ? "收起详情" : "展开详细记录"}</button>
          <button onClick={handleRemind} className="text-white/40 hover:text-white/60">稍后提醒</button>
        </div>
        {showDetail && <FeedbackDetailForm record={r} onSave={async (detail) => { if (user) { await updateRecord({ ...r, feedback: { ...r.feedback, detail } }, user.id); advance() } }} />}
      </div>
    </div>
  )
}

function FeedbackDetailForm({ onSave }: { record: DivinationRecord; onSave: (d: FeedbackDetail) => Promise<void> }) {
  const [actualResult, setActualResult] = useState("")
  const [satisfaction, setSatisfaction] = useState(3)
  const [actionTaken, setActionTaken] = useState("")
  const [aiInfluenced, setAiInfluenced] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")

  return (
    <div className="space-y-3 pt-3 border-t border-white/10">
      <div><label className="block text-xs text-white/40 mb-1">实际结果</label><input type="text" className="input-luxury w-full p-2 text-sm" value={actualResult} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualResult(e.target.value)} placeholder="发生了什么事？" /></div>
      <div><label className="block text-xs text-white/40 mb-1">满意度 ({satisfaction}/5)</label><input type="range" min="1" max="5" value={satisfaction} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSatisfaction(+e.target.value)} className="w-full accent-gold" /></div>
      <div><label className="block text-xs text-white/40 mb-1">实际行动</label><input type="text" className="input-luxury w-full p-2 text-sm" value={actionTaken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionTaken(e.target.value)} placeholder="你实际做了什么？" /></div>
      <div><label className="block text-xs text-white/40 mb-1">AI 是否影响了你的决策？</label><div className="flex gap-4"><label className="text-sm text-white/60"><input type="radio" name="ai" checked={aiInfluenced===true} onChange={()=>setAiInfluenced(true)} className="accent-gold" /> 是</label><label className="text-sm text-white/60"><input type="radio" name="ai" checked={aiInfluenced===false} onChange={()=>setAiInfluenced(false)} className="accent-gold" /> 否</label></div></div>
      <div><label className="block text-xs text-white/40 mb-1">备注</label><input type="text" className="input-luxury w-full p-2 text-sm" value={notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} /></div>
      <button onClick={() => onSave({ actualResult: actualResult||undefined, satisfaction, actionTaken: actionTaken||undefined, aiInfluencedDecision: aiInfluenced??undefined, notes: notes||undefined })} className="w-full py-2.5 btn-gold text-sm rounded-lg">保存详情</button>
    </div>
  )
}
