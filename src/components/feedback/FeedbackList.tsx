import { useState, useEffect } from "react"
import { queryPendingDue, updateRecord } from "../../db/records.js"
import { remindLater } from "../../lib/feedback-due.js"
import type { DivinationRecord, FeedbackStatus, FeedbackDetail } from "../../types"

interface FeedbackListProps { onAllDone: () => void }

export default function FeedbackList({ onAllDone }: FeedbackListProps) {
  const [records, setRecords] = useState<DivinationRecord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    queryPendingDue().then((r) => {
      setRecords(r)
      setLoaded(true)
      if (r.length === 0) onAllDone()
    })
  }, [onAllDone])

  const advance = () => {
    const next = currentIdx + 1
    if (next >= records.length) { onAllDone(); return }
    setCurrentIdx(next)
    setShowDetail(false)
  }

  const handleStatus = async (status: FeedbackStatus): Promise<void> => {
    const record = records[currentIdx]
    if (!record) return
    await updateRecord({ ...record, feedback: { ...record.feedback, status } })
    advance()
  }

  const handleRemind = async (): Promise<void> => {
    const record = records[currentIdx]
    if (!record) return
    await updateRecord({ ...record, feedback: { ...record.feedback, dueAt: remindLater() } })
    advance()
  }

  if (!loaded || records.length === 0) return null

  const r = records[currentIdx]
  if (!r) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-semibold text-ink">该反馈了</h3>
        <p className="text-ink-light">{r.question}</p>
        <p className="text-sm text-stone-500">{new Date(r.timestamp).toLocaleDateString("zh-CN")} · {r.category}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => handleStatus("accurate")} className="px-6 py-3 bg-jade text-white rounded-lg font-medium hover:opacity-90 transition-all">准</button>
          <button onClick={() => handleStatus("inaccurate")} className="px-6 py-3 bg-vermillion text-white rounded-lg font-medium hover:bg-vermillion-dark transition-all">不准</button>
          <button onClick={() => handleStatus("unclear")} className="px-6 py-3 bg-stone-500 text-white rounded-lg font-medium hover:bg-stone-600 transition-all">不清楚</button>
        </div>
        <div className="flex justify-between text-sm">
          <button onClick={() => setShowDetail(!showDetail)} className="text-vermillion hover:text-vermillion-dark">{showDetail ? "收起详情" : "展开详细记录"}</button>
          <button onClick={handleRemind} className="text-stone-500 hover:text-ink-light">稍后提醒</button>
        </div>
        {showDetail && <FeedbackDetailForm record={r} onSave={async (detail) => { await updateRecord({ ...r, feedback: { ...r.feedback, detail } }); advance() }} />}
      </div>
    </div>
  )
}

function FeedbackDetailForm({ record: _r, onSave }: { record: DivinationRecord; onSave: (d: FeedbackDetail) => Promise<void> }) {
  const [actualResult, setActualResult] = useState("")
  const [satisfaction, setSatisfaction] = useState(3)
  const [actionTaken, setActionTaken] = useState("")
  const [aiInfluenced, setAiInfluenced] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")

  return (
    <div className="space-y-3 pt-3 border-t border-stone-200">
      <div><label className="block text-xs text-stone-500 mb-1">实际结果</label><input type="text" className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/30" value={actualResult} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualResult(e.target.value)} placeholder="发生了什么事？" /></div>
      <div><label className="block text-xs text-stone-500 mb-1">满意度 ({satisfaction}/5)</label><input type="range" min="1" max="5" value={satisfaction} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSatisfaction(+e.target.value)} className="w-full accent-vermillion" /></div>
      <div><label className="block text-xs text-stone-500 mb-1">实际行动</label><input type="text" className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/30" value={actionTaken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionTaken(e.target.value)} placeholder="你实际做了什么？" /></div>
      <div><label className="block text-xs text-stone-500 mb-1">AI 是否影响了你的决策？</label><div className="flex gap-4"><label className="text-sm text-ink-light"><input type="radio" name="ai" checked={aiInfluenced===true} onChange={()=>setAiInfluenced(true)} className="accent-vermillion" /> 是</label><label className="text-sm text-ink-light"><input type="radio" name="ai" checked={aiInfluenced===false} onChange={()=>setAiInfluenced(false)} className="accent-vermillion" /> 否</label></div></div>
      <div><label className="block text-xs text-stone-500 mb-1">备注</label><input type="text" className="w-full border border-stone-300 rounded-lg p-2 text-sm bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/30" value={notes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)} /></div>
      <button onClick={() => onSave({ actualResult: actualResult||undefined, satisfaction, actionTaken: actionTaken||undefined, aiInfluencedDecision: aiInfluenced??undefined, notes: notes||undefined })} className="w-full py-2.5 bg-vermillion text-white text-sm rounded-lg font-medium hover:bg-vermillion-dark transition-colors">保存详情</button>
    </div>
  )
}
